import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma"; 

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);


    const totalRevenueResult = await prisma.orders.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: { not: "Cancelled" }, 
      },
    });

    const totalOrders = await prisma.orders.count();
    
    
    const activeCarts = await prisma.carts.count({
      where: { isOrdered: false },
    });

    const abandonedCarts = await prisma.carts.count({
      where: {
        isOrdered: false,
        updatedAt: { lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }, 
      },
    });

    
    const awaitingShipment = await prisma.orders.count({
      where: { status: "Shipped" },
    });

    const processing = await prisma.orders.count({
      where: { status: "Pending" },
    });

    
    const lowStockWarnings = await prisma.products.count({
      where: { stock: { lte: 5 } },
    });

    
    const lowStockProductsList = await prisma.products.findMany({
      where: { stock: { lte: 5 } },
      select: { name: true, stock: true },
      orderBy: { stock: "asc" },
      take: 2,
    });

    const grossRevenue = Number(totalRevenueResult._sum.totalAmount || 0);

  
    const recentOrders = await prisma.orders.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { not: "Cancelled" },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const trendMap = {};
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      trendMap[daysOfWeek[d.getDay()]] = 0;
    }

    recentOrders.forEach((order) => {
      const orderDate = order.createdAt || new Date();
      const dayName = daysOfWeek[new Date(orderDate).getDay()];
      if (trendMap[dayName] !== undefined) {
        trendMap[dayName] += Number(order.totalAmount || 0);
      }
    });

    const revenueTrend = Object.keys(trendMap).map((day) => ({
      day,
      revenue: trendMap[day],
    }));

    const productsList = await prisma.products.findMany({
      select: {
        id: true,
        category: true,
      },
    });

    const categories = [...new Set(productsList.map((p) => p.category || "All"))];

    

    const productCategoryMap = {};
    productsList.forEach((p) => {
      productCategoryMap[p.id] = p.category;
    });

    

    const allCarts = await prisma.carts.findMany({
      select: {
        productId: true,
        isOrdered: true,
      },
    });

    const conversionData = categories.slice(0, 4).map((cat) => {
      const filteredCarts = allCarts.filter(
        (cart) => productCategoryMap[cart.productId] === cat
      );

      const cartCount = filteredCarts.length;
      const orderCount = filteredCarts.filter((c) => c.isOrdered).length;

      return {
        name: cat.replace("-", " ").toUpperCase(),
        carts: cartCount,
        orders: orderCount,
      };
    });

 
    const topProductsRaw = await prisma.carts.groupBy({
      by: ["name"],
      where: { isOrdered: true },
      _sum: { quantity: true },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 3,
    });

    const topProducts = await Promise.all(
      topProductsRaw.map(async (item) => {
        const prodDetails = await prisma.products.findFirst({
          where: { name: item.name },
          select: { stock: true, price: true },
        });

        const sales = item._sum.quantity || 0;
        const price = prodDetails?.price || 0;

        return {
          name: item.name,
          sales,
          stock: prodDetails?.stock || 0,
          revenue: `$${(sales * price).toFixed(2)}`,
        };
      })
    );

    return NextResponse.json({
      stats: {
        totalRevenue: `$${grossRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        activeCarts,
        abandonedCarts,
        totalOrders,
        awaitingShipment,
        processing,
        lowStockWarnings,
      },
      lowStockProducts: lowStockProductsList,
      revenueTrend,
      conversionData,
      topProducts,
    });
  } catch (error) {
    console.error("Failed to build administrative analytics metrics pipeline:", error);
    return NextResponse.json({ error: "Failed to extract database analytics" }, { status: 500 });
  }
}