import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // 1. Calculate Gross Revenue from non-cancelled orders
    const totalRevenueResult = await prisma.orders.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: { not: "Cancelled" },
      },
    });
    const grossRevenue = Number(totalRevenueResult._sum.totalAmount || 0);

    // 2. Order Status Counters
    const totalOrders = await prisma.orders.count();

    const awaitingShipment = await prisma.orders.count({
      where: { status: "Shipped" },
    });

    const processing = await prisma.orders.count({
      where: { status: "Pending" },
    });

    // 3. Cart Session Tracking
    const activeCarts = await prisma.carts.count({
      where: { isOrdered: false },
    });

    const abandonedCarts = await prisma.carts.count({
      where: {
        isOrdered: false,
        updatedAt: { lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    });

    // 4. LOW STOCK WARNINGS PER COLOR & PER SIZE
    const allProducts = await prisma.products.findMany({
      select: { id: true, name: true, stock: true, sizes: true, price: true, category: true },
    });

    const lowStockVariantsList = [];

    allProducts.forEach((prod) => {
      const parsedSizes =
        typeof prod.sizes === "string" ? JSON.parse(prod.sizes) : prod.sizes || {};

      // Parse nested colors and sizes (e.g., { "white": { "S": 2, "M": 10 } })
      Object.keys(parsedSizes).forEach((colorKey) => {
        const sizesMap = parsedSizes[colorKey];
        if (typeof sizesMap === "object" && sizesMap !== null) {
          Object.keys(sizesMap).forEach((sizeKey) => {
            const variantStock = Number(sizesMap[sizeKey] || 0);

            // Trigger warning when an individual color/size variant has 5 or fewer items left
            if (variantStock <= 5) {
              lowStockVariantsList.push({
                id: prod.id,
                name: prod.name,
                color: colorKey,
                size: sizeKey,
                stock: variantStock,
              });
            }
          });
        }
      });
    });

    // Sort low stock variants starting with lowest quantity left
    lowStockVariantsList.sort((a, b) => a.stock - b.stock);

    // 5. Build 7-Day Revenue Trend Chart Data
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

    // 6. Build Category Conversion Analytics (Carts vs Purchased)
    const categories = [
      ...new Set(allProducts.map((p) => p.category || "General")),
    ];

    const productCategoryMap = {};
    allProducts.forEach((p) => {
      productCategoryMap[p.id] = p.category || "General";
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

    // 7. BUILD TOP PRODUCTS LEADERBOARD
    const topProductsRaw = await prisma.carts.groupBy({
      by: ["name"],
      where: { isOrdered: true },
      _sum: { quantity: true },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const topProducts = await Promise.all(
      topProductsRaw.map(async (item) => {
        const prodDetails = allProducts.find((p) => p.name === item.name);

        const sales = item._sum.quantity || 0;
        const price = prodDetails?.price || 0;

        return {
          id: prodDetails?.id,
          name: item.name,
          sales,
          stock: prodDetails?.stock || 0,
          revenue: `$${(sales * price).toFixed(2)}`,
        };
      })
    );

    return NextResponse.json({
      stats: {
        totalRevenue: `$${grossRevenue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        activeCarts,
        abandonedCarts,
        totalOrders,
        awaitingShipment,
        processing,
        lowStockWarnings: lowStockVariantsList.length,
      },
      lowStockProducts: lowStockVariantsList.slice(0, 5), // Top 5 critical variants
      revenueTrend,
      conversionData,
      topProducts,
    });
  } catch (error) {
    console.error("Failed to build administrative analytics metrics pipeline:", error);
    return NextResponse.json(
      { error: "Failed to extract database analytics" },
      { status: 500 }
    );
  }
}