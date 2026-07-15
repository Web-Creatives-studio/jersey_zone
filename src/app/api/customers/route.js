import { NextResponse } from "next/server";
import {prisma} from "../../lib/prisma"

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch users and pull related orders arrays cleanly
    const usersFromDb = await prisma.user.findMany({
      include: {
        orders: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Map and aggregate fields into your custom format
    const formattedCustomers = usersFromDb.map((customer) => {
      const ordersList = customer.orders || [];
      const totalOrdersCount = ordersList.length;

      // Calculate lifetime total spent values safely
      const totalSpentNumeric = ordersList.reduce(
        (acc, order) => acc + Number(order.totalAmount || 0),
        0
      );

      // Determine the segment status based on total lifetime spend or transaction quantities
      let segmentStatus = "Active";
      if (totalOrdersCount === 0) {
        segmentStatus = "Inactive";
      } else if (totalSpentNumeric >= 1000) {
        segmentStatus = "VIP";
      }

      // Safeguard extraction checks on raw json items arrays
      let recentPurchaseItemName = "None";
      if (totalOrdersCount > 0 && ordersList[0].items) {
        try {
          const itemsArray = typeof ordersList[0].items === "string" 
            ? JSON.parse(ordersList[0].items) 
            : ordersList[0].items;

          if (Array.isArray(itemsArray) && itemsArray.length > 0) {
            recentPurchaseItemName = itemsArray[0].name || "Product Record Found";
          }
        } catch (e) {
          console.error("Failed parsing order items json context fields:", e);
        }
      }

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        joinedDate: customer.createdAt 
          ? new Date(customer.createdAt).toISOString().split("T")[0] 
          : "N/A",
        totalOrders: totalOrdersCount,
        totalSpent: `$${totalSpentNumeric.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: segmentStatus,
        recentPurchase: recentPurchaseItemName,
      };
    });

    return NextResponse.json(formattedCustomers);
  } catch (error) {
    console.error("Failed to construct customer directory schema views:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}