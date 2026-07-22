import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

// ==========================================
// GET: Fetch Orders (Smart Admin vs Buyer Router)
// ==========================================
export async function GET(request) {

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const orderId = searchParams.get("id");

    if (orderId) {
      const order = await prisma.orders.findUnique({
        where: { id: orderId },
      });
      if (!order)
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      return NextResponse.json(order);
    }

    const whereClause = {};

    if (userId) {
      whereClause.userId = userId;
    } else if (email) {
      whereClause.customerEmail = email;
    }

    const orders = await prisma.orders.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed fetching orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ==========================================
// POST: Place New Order (Handles atomic inventory deduction and marks purchased items ordered)
// ==========================================
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id,
      userId,
      customerEmail,
      customerName,
      subtotal,
      totalAmount,
      discount,
      shipping,
      items,
      shippingAddress,
      status,
      paymentStatus,
    } = body;

    if (!id || !customerEmail || !items || !shippingAddress) {
      return NextResponse.json(
        { message: "Missing required checkout parameters" },
        { status: 400 },
      );
    }

    const transactionResult = await prisma.$transaction(
      async (tx) => {
        // 🌟 1. Extract explicit cart primary key IDs sent from frontend
        const purchasedCartIds = items
          .map((item) => item.cart_id || item.cartId || item.id)
          .filter(
            (cartId) => typeof cartId === "string" && cartId.trim().length > 0,
          );

        // 2. Loop through items and perform stock checks & atomic modifications
        for (const item of items) {
          const productId = item.product_id || item.productId;
          const normalizedColor = item.selected_color?.toLowerCase().trim();

          const targetProduct = await tx.products.findUnique({
            where: { id: productId },
            select: { sizes: true, name: true },
          });

          if (!targetProduct) {
            throw new Error(`Product ${item.name} could not be found.`);
          }

          const currentSizesObj =
            typeof targetProduct.sizes === "string"
              ? JSON.parse(targetProduct.sizes)
              : targetProduct.sizes || {};

          const variantAvailableStock =
            currentSizesObj[normalizedColor]?.[item.selected_size] || 0;

          if (variantAvailableStock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${targetProduct.name} (${item.selected_color} - ${item.selected_size}). Available: ${variantAvailableStock}`,
            );
          }

          // Atomic update on products table
          await tx.$executeRaw`
            UPDATE "products"
            SET sizes = jsonb_set(
              sizes, 
              array[${normalizedColor}, ${item.selected_size}], 
              to_jsonb(coalesce((sizes->${normalizedColor}->>${item.selected_size})::int, 0) - ${parseInt(item.quantity)})
            )
            WHERE id = ${productId};
          `;

          // Recalculate global rolling counters
          const reFetchedProduct = await tx.products.findUnique({
            where: { id: productId },
            select: { sizes: true },
          });

          const refreshedSizesMap =
            typeof reFetchedProduct.sizes === "string"
              ? JSON.parse(reFetchedProduct.sizes)
              : reFetchedProduct.sizes || {};

          const recalculatedGlobalStockCount = Object.values(
            refreshedSizesMap,
          ).reduce((totalSum, sizeSubMap) => {
            return (
              totalSum +
              Object.values(sizeSubMap).reduce(
                (subSum, stockQty) => subSum + Math.max(0, Number(stockQty)),
                0,
              )
            );
          }, 0);

          await tx.products.update({
            where: { id: productId },
            data: { stock: recalculatedGlobalStockCount },
          });
        }

        // 🌟 3. Target ONLY the explicitly selected cart primary key IDs
        if (userId && purchasedCartIds.length > 0) {
          await tx.carts.updateMany({
            where: {
              customerId: userId,
              id: { in: purchasedCartIds }, // 👈 STRICT PRIMARY KEY FILTER HERE
              isOrdered: false,
            },
            data: {
              isOrdered: true,
            },
          });
        }

        // 4. Create order document
        const createdOrder = await tx.orders.create({
          data: {
            id,
            userId: userId || null,
            customerEmail,
            customerName,
            subtotal: parseFloat(subtotal),
            totalAmount: parseFloat(totalAmount),
            discount: parseFloat(discount),
            shipping: parseFloat(shipping),
            items: items,
            shippingAddress: shippingAddress,
            status: status || "Pending",
            paymentStatus: paymentStatus || "Unpaid",
          },
        });

        return createdOrder;
      },

      {
        maxWait: 5000,
        timeout: 15000,
      },
    );

    return NextResponse.json(
      { message: "Order placed successfully", order: transactionResult },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Failed creating order transaction execution:",
      error.message,
    );
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ==========================================
// PUT: Update Order Properties
// ==========================================
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status, paymentStatus, shippingAddress, items } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Order Identification Missing" },
        { status: 400 },
      );
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: id },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(shippingAddress && {
          shippingAddress:
            typeof shippingAddress === "string"
              ? shippingAddress
              : JSON.stringify(shippingAddress),
        }),
        ...(items && {
          items: typeof items === "string" ? items : JSON.stringify(items),
        }),
      },
    });

    return NextResponse.json({
      message: "Order updated successfully",
      updatedOrder,
    });
  } catch (error) {
    console.error("Failed updating flat order row:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
