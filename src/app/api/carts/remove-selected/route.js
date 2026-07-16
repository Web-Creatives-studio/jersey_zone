import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // Adjust path to match your layout

export const dynamic = "force-dynamic";

export async function DELETE(req) {
  try {
    const { customerId, selectedIds } = await req.json();

    // Guard rails check: make sure we have active strings to run against
    if (!customerId || !selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
      return NextResponse.json(
        { message: "Missing required selection parameters" },
        { status: 400 }
      );
    }

    // Delete ONLY rows whose unique primary key string matches the explicit array
    await prisma.carts.deleteMany({
      where: {
        customerId: customerId,
        id: {
          in: selectedIds, // [ "cart-id-1", "cart-id-2" ]
        },
        isOrdered: false, // Double guard layer
      },
    });

    return NextResponse.json({ message: "Selected rows successfully purged from your database cart." });
  } catch (error) {
    console.error("Error purging selected items from database cart:", error);
    return NextResponse.json(
      { message: "Failed to purge database selections: " + error.message },
      { status: 500 }
    );
  }
}