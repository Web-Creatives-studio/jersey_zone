import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(req) {
  try {
    const { customerId, selectedIds } = await req.json();

    if (!customerId) {
      return NextResponse.json({ message: "Missing customerId" }, { status: 400 });
    }

    // Ensure selectedIds is an array of clean strings
    const validIds = Array.isArray(selectedIds)
      ? selectedIds.filter((id) => typeof id === "string" && id.trim().length > 0)
      : [];

    // 🚨 EMERGENCY BRAKE: If no valid IDs were passed, STOP immediately!
    if (validIds.length === 0) {
      console.warn("⚠️ DELETE aborted: No valid cart row IDs were provided.");
      return NextResponse.json(
        { message: "Aborted: No valid row IDs provided. Cart untouched." },
        { status: 400 }
      );
    }

    // Delete ONLY rows whose primary key explicitly matches
    const deleteResult = await prisma.carts.deleteMany({
      where: {
        customerId: customerId,
        id: { in: validIds }, // 👈 STRICT PRIMARY KEY FILTER
        isOrdered: false,
      },
    });

    console.log(`✅ Safely deleted ${deleteResult.count} cart rows for user ${customerId}`);

    return NextResponse.json({
      message: "Selected items successfully removed.",
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    console.error("Error deleting selected cart rows:", error);
    return NextResponse.json(
      { message: "Failed to delete selected rows: " + error.message },
      { status: 500 }
    );
  }
}