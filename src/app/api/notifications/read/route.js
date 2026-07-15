import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // Adjust path to match your client instance layout

export async function PUT() {
  try {
    // Perform efficient updateMany on unread notification rows
    const result = await prisma.notifications.updateMany({
      where: {
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "All notifications synced as read successfully",
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Notification reconciliation crash:", error);
    return NextResponse.json(
      { error: "Database transmission engine failure: " + error.message },
      { status: 500 }
    );
  }
}