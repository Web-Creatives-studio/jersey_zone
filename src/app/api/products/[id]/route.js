import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client (preferably use a singleton pattern in production)
const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    // Next.js requires awaiting params in modern versions
    const resolvedParams = await params;
    const productId = resolvedParams.id;

    // 1. Query your database using Prisma
    // Note: Change 'product' if your model is named differently (e.g., prisma.item)
    const dbProduct = await prisma.products.findUnique({
      where: {
        id: productId, // Change 'id' if your primary key is named 'product_id', etc.
      },
    
    });

    // 2. If the product is not found in your database, don't crash!
    // Return a baseline object so the frontend can still use the mock stats.
    if (!dbProduct) {
      return NextResponse.json({
        id: productId,
        name: "Unknown Product",
        subtitle: "Not found in database, using fallback layout",
        createdAt: new Date().toISOString()
      });
    }

    // 3. Return the real database product data
    return NextResponse.json(dbProduct);

  } catch (error) {
    console.error("Prisma Database Error:", error);
    
    // Return a controlled 500 error structure instead of crashing the server
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        message: "Failed to fetch product from database" 
      },
      { status: 500 }
    );
  } finally {
    // Optional: Disconnect client if not using a global singleton instance
    await prisma.$disconnect();
  }
}