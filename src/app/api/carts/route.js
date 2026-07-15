import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      id, 
      customerId, 
      productId, 
      customerName,
      name, 
      price, 
      quantity = 1, 
      selectedColor, 
      selectedSize, 
      images // 👈 Plain string URL from frontend
    } = body;

    if (!customerId || !productId) {
      return NextResponse.json({ message: "Missing essential identifiers" }, { status: 400 });
    }

    // Check if the exact variations combination exists in the open user cart
    const existingVariation = await prisma.carts.findFirst({
      where: {
        customerId,
        productId,
        selectedColor,
        selectedSize,
        isOrdered: false
      }
    });

    if (existingVariation) {
      // If found, increment quantity configuration ruleset
      const updatedItem = await prisma.carts.update({
        where: { id: existingVariation.id },
        data: { quantity: existingVariation.quantity + Number(quantity) }
      });
      return NextResponse.json(updatedItem);
    }

    // If completely unique layout item, create a new row using the string ID
    const newCart = await prisma.carts.create({
      data: {
        id, 
        customerId,
        productId,
        customerName: customerName || "Guest Buyer",
        name,
        price: Number(price),
        quantity: Number(quantity),
        selectedColor,
        selectedSize,
        images: images || "/placeholder.jpeg", // 👈 Saves perfectly as a flat string URL
      }
    });

    return NextResponse.json(newCart, { status: 201 });
  } catch (error) {
    console.error("Cart API Error:", error);
    return NextResponse.json({ message: "Database engine sync failed: " + error.message }, { status: 500 });
  }
}

// B. GET: Read open cart allocations safely back to client engine states
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "Missing identity search filter target parameters" }, { status: 400 });
    }

    const items = await prisma.carts.findMany({
      where: { customerId, isOrdered: false },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read database records" }, { status: 500 });
  }
}