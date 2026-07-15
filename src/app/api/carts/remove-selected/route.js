import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function DELETE(req) {
  try {
    const { customerId, selectedIds } = await req.json();

    if (!customerId || !selectedIds || !Array.isArray(selectedIds)) {
      return NextResponse.json(
        { message: "Missing required selection parameters" },
        { status: 400 }
      );
    }

    // Delete only the specific cart rows that the user had checked
    await prisma.carts.deleteMany({
      where: {
        customerId,
        id: {
          in: selectedIds,
        },
        isOrdered: false, // Ensure we don't accidentally drop completed orders history
      },
    });

    return NextResponse.json({ message: "Selected items successfully purged from database cart" });
  } catch (error) {
    console.error("Error purging selected items from database cart:", error);
    return NextResponse.json(
      { message: "Failed to purge database selections: " + error.message },
      { status: 500 }
    );
  }
}