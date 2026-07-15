import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";// Adjust path to match your client instance layout

export async function GET() {
  try {
    // Run all counts in parallel for optimal database speed execution
    const [productsCount, newOrdersCount, marketingCount, unreadNotificationsCount, userCount] = await prisma.$transaction([
      prisma.products.count(),
      prisma.orders.count({ where: { status: "Pending" } }), // Tracks open 'New' entries
      prisma.EmailAutomation.count(),
      prisma.notifications.count({ where: { read: false } }), // Tracks unread metrics only
      prisma.user.count()
    ]);

    return NextResponse.json({
      products: productsCount,
      orders: newOrdersCount,
      marketing: marketingCount,
      notifications: unreadNotificationsCount,
      users: userCount
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to aggregate sidebar database live feeds" }, { status: 500 });
  }
}