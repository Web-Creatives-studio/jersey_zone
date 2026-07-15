import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // Adjust path to match your layout configurations

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { customerId } = body;

    // 1. Validate parameter existence
    if (!customerId) {
      return NextResponse.json(
        { error: "Missing required customer identification token parameter" },
        { status: 400 }
      );
    }

    // 2. Wipe only the un-purchased open cart rows belonging to this user
    const clearResult = await prisma.carts.deleteMany({
      where: {
        customerId: customerId,
        isOrdered: false, // Ensure we never touch historical, checked-out records
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Cart cleared successfully from database engine", 
        clearedCount: clearResult.count 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Clear Cart API Error:", error);
    return NextResponse.json(
      { error: "Database transaction failed: " + error.message },
      { status: 500 }
    );
  }
}