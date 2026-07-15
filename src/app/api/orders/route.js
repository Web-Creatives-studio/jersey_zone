import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ==========================================
// POST: Place New Order (Handles atomic inventory deduction and marks cart items ordered)
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
      paymentStatus 
    } = body;

    if (!id || !customerEmail || !items || !shippingAddress) {
      return NextResponse.json({ message: "Missing required checkout parameters" }, { status: 400 });
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      
      // 1. Loop through items and perform stock checks & atomic modifications
      for (const item of items) {
        const normalizedColor = item.selected_color.toLowerCase().trim();
        
        const targetProduct = await tx.products.findUnique({
          where: { id: item.product_id },
          select: { sizes: true, name: true }
        });

        if (!targetProduct) {
          throw new Error(`Product ${item.name} could not be found.`);
        }

        const currentSizesObj = typeof targetProduct.sizes === "string" 
          ? JSON.parse(targetProduct.sizes) 
          : (targetProduct.sizes || {});
          
        const variantAvailableStock = currentSizesObj[normalizedColor]?.[item.selected_size] || 0;

        if (variantAvailableStock < item.quantity) {
          throw new Error(`Insufficient stock for ${targetProduct.name} (${item.selected_color} - ${item.selected_size}). Available: ${variantAvailableStock}`);
        }

        // 2. Perform Option 2: Atomic update on your exact "products" table name
        await tx.$executeRaw`
          UPDATE "products"
          SET sizes = jsonb_set(
            sizes, 
            array[${normalizedColor}, ${item.selected_size}], 
            to_jsonb(coalesce((sizes->${normalizedColor}->>${item.selected_size})::int, 0) - ${parseInt(item.quantity)})
          )
          WHERE id = ${item.product_id};
        `;

        // 3. Recalculate global rolling counters
        const reFetchedProduct = await tx.products.findUnique({
          where: { id: item.product_id },
          select: { sizes: true }
        });

        const refreshedSizesMap = typeof reFetchedProduct.sizes === "string" 
          ? JSON.parse(reFetchedProduct.sizes) 
          : (reFetchedProduct.sizes || {});
        
        const recalculatedGlobalStockCount = Object.values(refreshedSizesMap).reduce((totalSum, sizeSubMap) => {
          return totalSum + Object.values(sizeSubMap).reduce((subSum, stockQty) => subSum + Math.max(0, Number(stockQty)), 0);
        }, 0);

        await tx.products.update({
          where: { id: item.product_id },
          data: { stock: recalculatedGlobalStockCount }
        });
      }

      // 🌟 Step 3.5: If userId is present, set isOrdered to true for all active cart records
      if (userId) {
        await tx.carts.updateMany({
          where: {
            customerId: userId,
            isOrdered: false, // Target only uncompleted purchases
          },
          data: {
            isOrdered: true, // Switch values safely within the secure database loop
          },
        });
      }

      // 4. Create your order document
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
    });

    return NextResponse.json({ message: "Order placed successfully", order: transactionResult }, { status: 201 });
  } catch (error) {
    console.error("Failed creating order transaction execution:", error.message);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
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
      return NextResponse.json({ error: "Order Identification Missing" }, { status: 400 });
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: id },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(shippingAddress && { shippingAddress: typeof shippingAddress === "string" ? shippingAddress : JSON.stringify(shippingAddress) }), 
        ...(items && { items: typeof items === "string" ? items : JSON.stringify(items) }),                                    
      },
    });

    return NextResponse.json({ message: "Order updated successfully", updatedOrder });
  } catch (error) {
    console.error("Failed updating flat order row:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}