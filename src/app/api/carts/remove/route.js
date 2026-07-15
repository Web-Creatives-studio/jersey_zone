import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // Adjust this path to your prisma client location

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { customerId, id } = body;

    // 1. Validate incoming parameters
    if (!customerId || !id) {
      return NextResponse.json(
        { error: "Missing required customerId or item line id parameter" },
        { status: 400 }
      );
    }

    // 2. Perform safe target delete matching both unique row id and owner customerId
    const deleteResult = await prisma.carts.deleteMany({
      where: {
        id: id,                 // Matches the generated custom row id (e.g. 'cmr5uq...')
        customerId: customerId, // Safeguard to ensure users can only clear their own cart items
        isOrdered: false,       // Only touch un-purchased open items
      },
    });

    // 3. Return response state conditions
    if (deleteResult.count === 0) {
      return NextResponse.json(
        { message: "No matching active item line found to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Item row removed successfully from database cloud state" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cart item removal engine crash:", error);
    return NextResponse.json(
      { error: "Database transmission failed: " + error.message },
      { status: 500 }
    );
  }
}