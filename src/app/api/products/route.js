import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma"; 
import fs from "fs/promises";
import path from "path";

// 1. GET ALL PRODUCTS
export async function GET() {
  try {
    const products = await prisma.products.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 2. POST / CREATE A NEW PRODUCT
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const rawData = formData.get("data");
    if (!rawData) {
      return NextResponse.json(
        { success: false, message: "Missing product data payload structure." },
        { status: 400 }
      );
    }

    const parsedPayload = JSON.parse(rawData);
    const finalImagesMap = { ...parsedPayload.images };

    for (const color of parsedPayload.colors) {
      const fileKey = `images_${color}`;
      const file = formData.get(fileKey);

      if (file && typeof file !== "string") {
        const uploadDir = path.join(process.cwd(), "public", "products");
        await fs.mkdir(uploadDir, { recursive: true });

        const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = path.join(uploadDir, safeFileName);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);

        finalImagesMap[color] = `/products/${safeFileName}`;
      }
    }

    const newProduct = await prisma.products.create({
      data: {
        name: parsedPayload.name,
        slug: parsedPayload.slug,
        description: parsedPayload.description || "",
        category: parsedPayload.category,
        price: parseFloat(parsedPayload.price) || 0,
        stock: parseInt(parsedPayload.stock) || 0,
        featured: Boolean(parsedPayload.featured),
        colors: parsedPayload.colors,
        sizes: parsedPayload.sizes,
        images: finalImagesMap,
      },
    });

    return NextResponse.json({
      success: true,
      product: newProduct,
    }, { status: 201 });

  } catch (error) {
    console.error("POST Product Variant Processing Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 3. PUT / UPDATE AN EXISTING PRODUCT
export async function PUT(request) {
  try {
    const formData = await request.formData();
    
    const rawData = formData.get("data");
    if (!rawData) {
      return NextResponse.json(
        { success: false, message: "Missing product data payload structure." },
        { status: 400 }
      );
    }

    const parsedPayload = JSON.parse(rawData);
    
    if (!parsedPayload.id) {
      return NextResponse.json(
        { success: false, message: "Missing explicit Product ID target." },
        { status: 400 }
      );
    }

    // Keep existing saved image strings as fallback paths if no replacements are uploaded
    const finalImagesMap = { ...parsedPayload.images };

    // Process new variant file streams matching current selected target colors list
    for (const color of parsedPayload.colors) {
      const fileKey = `images_${color}`;
      const file = formData.get(fileKey);

      // Only re-write file if an actual dynamic File binary data stream was packaged
      if (file && typeof file !== "string") {
        const uploadDir = path.join(process.cwd(), "public", "products");
        await fs.mkdir(uploadDir, { recursive: true });

        const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filePath = path.join(uploadDir, safeFileName);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);

        finalImagesMap[color] = `/products/${safeFileName}`;
      }
    }

    const updatedProduct = await prisma.products.update({
      where: { id: parsedPayload.id },
      data: {
        name: parsedPayload.name,
        slug: parsedPayload.slug,
        description: parsedPayload.description || "",
        category: parsedPayload.category,
        price: parseFloat(parsedPayload.price) || 0,
        stock: parseInt(parsedPayload.stock) || 0,
        featured: Boolean(parsedPayload.featured),
        colors: parsedPayload.colors,
        sizes: parsedPayload.sizes,
        images: finalImagesMap,
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    }, { status: 200 });

  } catch (error) {
    console.error("PUT Product Modification Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 4. DELETE / SINGLE OR BULK REMOVALS
// Supports both a single explicit ID query option: /api/products?id=123
// or a comma-separated bulk multi-row selection payload query option: /api/products?ids=123,456,789
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const idsString = searchParams.get("ids");

    if (!id && !idsString) {
      return NextResponse.json(
        { success: false, message: "Please specify target ID or collection items array parameter identifiers." },
        { status: 400 }
      );
    }

    // Process multi-row batch selection array deletion
    if (idsString) {
      const targetsList = idsString.split(",").map(item => item.trim()).filter(Boolean);
      
      const bulkDeletionGroup = await prisma.products.deleteMany({
        where: {
          id: { in: targetsList }
        }
      });

      return NextResponse.json({
        success: true,
        message: `Bulk batch deletion cleared out ${bulkDeletionGroup.count} records.`,
      }, { status: 200 });
    }

    // Process standard singular record deletion row action
    await prisma.products.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: "Targeted product variant configuration removed successfully.",
    }, { status: 200 });

  } catch (error) {
    console.error("DELETE Request Operations Pipeline Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}