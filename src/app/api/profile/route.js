import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "userId parameter required" }, { status: 400 });
    }

    // 1. Fetch user orders
    const userOrders = await prisma.orders.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    // 2. Compute key metrics
    let totalSpent = 0;
    let activeOrdersCount = 0;
    const itemFrequencyMap = {};

    userOrders.forEach((order) => {
      // Add up spent total for paid/completed orders
      if (order.paymentStatus === "Paid" || order.status !== "Cancelled") {
        totalSpent += Number(order.totalAmount || 0);
      }

      // Count active non-fulfilled orders
      if (order.status === "Pending" || order.status === "Processing" || order.status === "Shipped") {
        activeOrdersCount += 1;
      }

      // Process order items to find the "Most Ordered Kit"
      let itemsList = [];
      try {
        itemsList = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []);
      } catch (e) {
        itemsList = [];
      }

      itemsList.forEach((item) => {
        const name = item.name || "Custom Jersey";
        const image = item.image || item.images || "/placeholder.jpeg";
        const key = `${name}___${image}`;

        if (!itemFrequencyMap[key]) {
          itemFrequencyMap[key] = {
            name,
            image,
            quantity: 0,
            totalSpentOnItem: 0,
          };
        }

        const qty = Number(item.quantity || 1);
        const price = Number(item.price || 0);
        itemFrequencyMap[key].quantity += qty;
        itemFrequencyMap[key].totalSpentOnItem += qty * price;
      });
    });

    // 3. Find top ordered product
    const sortedItems = Object.values(itemFrequencyMap).sort((a, b) => b.quantity - a.quantity);
    const mostOrderedItem = sortedItems.length > 0 ? sortedItems[0] : null;

    return NextResponse.json({
      totalOrders: userOrders.length,
      totalSpent,
      activeOrdersCount,
      mostOrderedItem,
      recentOrders: userOrders.slice(0, 3), // Return 3 most recent
    });
  } catch (error) {
    console.error("Failed fetching profile analytics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}