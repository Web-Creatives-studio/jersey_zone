import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    // 1. Next.js 15+ async params resolution
    const resolvedParams = await params;
    const productId = resolvedParams.id;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // 2. Fetch primary product record from PostgreSQL database
    const dbProduct = await prisma.products.findUnique({
      where: {
        id: productId,
      },
    });

    if (!dbProduct) {
      return NextResponse.json(
        {
          id: productId,
          name: "Unknown Product",
          subtitle: "Not found in database",
          createdAt: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 3. Compute Active Cart Items (Added to Cart per Color & Size)
    const cartItems = await prisma.carts.findMany({
      where: {
        productId,
        isOrdered: false,
      },
      select: {
        quantity: true,
        selectedColor: true,
        selectedSize: true,
      },
    });

    const cartStats = {};
    cartItems.forEach((item) => {
      const color = (item.selectedColor || "default").toLowerCase();
      const size = item.selectedSize || "M";
      const key = `${color}___${size}`;

      if (!cartStats[key]) cartStats[key] = 0;
      cartStats[key] += Number(item.quantity || 1);
    });

    // 4. Compute Delivered/Paid Orders (Revenue & Units Sold per Color & Size)
    const orders = await prisma.orders.findMany({
      where: {
        status: { not: "Cancelled" },
      },
      select: {
        items: true,
      },
    });

    const revenueStats = {};
    const salesCountStats = {};

    orders.forEach((order) => {
      let itemsList = [];
      try {
        itemsList = typeof order.items === "string" ? JSON.parse(order.items) : order.items || [];
      } catch (e) {
        itemsList = [];
      }

      itemsList.forEach((item) => {
        const itemProdId = item.product_id || item.productId || item.id;
        if (itemProdId === productId) {
          const color = (item.selected_color || item.selectedColor || "default").toLowerCase();
          const size = item.selected_size || item.selectedSize || "M";
          const key = `${color}___${size}`;

          const qty = Number(item.quantity || 1);
          const price = Number(item.price || dbProduct.price || 0);

          if (!revenueStats[key]) revenueStats[key] = 0;
          if (!salesCountStats[key]) salesCountStats[key] = 0;

          revenueStats[key] += qty * price;
          salesCountStats[key] += qty;
        }
      });
    });

    // 5. Return complete database record merged with analytics payload
    return NextResponse.json({
      ...dbProduct,
      analytics: {
        cartStats,
        revenueStats,
        salesCountStats,
      },
    });
  } catch (error) {
    console.error("Prisma Database Error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch product from database",
      },
      { status: 500 }
    );
  }
}