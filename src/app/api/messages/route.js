// app/api/messages/route.js
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

// ==========================================
// GET: Fetch message history & update read ticks
// ==========================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const viewer = searchParams.get("viewer"); 

    if (!customerId || !viewer) {
      return NextResponse.json(
        { message: "Missing required query parameters: customerId or viewer" }, 
        { status: 400 }
      );
    }

    const targetSender = viewer === "ADMIN" ? "CUSTOMER" : "ADMIN";

    await prisma.messages.updateMany({
      where: {
        customerId: customerId,
        sender: targetSender,
        read: false,
      },
      data: {
        read: true,
      },
    });

    const conversation = await prisma.messages.findMany({
      where: { customerId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(Array.isArray(conversation) ? conversation : []);
  } catch (error) {
    console.error("Exception in GET /api/messages:", error);
    return NextResponse.json({ message: "Database reading exception thrown" }, { status: 500 });
  }
}

// ==========================================
// POST: Save an inbound or outbound message
// ==========================================
export async function POST(request) {
  try {
    let { customerId, customerName, sender, text } = await request.json();

    if (!customerId || !sender || !text) {
      return NextResponse.json({ message: "Missing required payload parameters" }, { status: 400 });
    }

    // 🌟 ENHANCED SECURITY LOOKUP: Clean up name discrepancies
    if (sender === "ADMIN") {
      // Look back for any message sent on this customerId thread to inherit their true name identifier
      const distinctThreadIdentity = await prisma.messages.findFirst({
        where: { 
          customerId: customerId,
          NOT: { customerName: "Guest Buyer" } // Don't inherit the placeholder generic string
        },
        orderBy: { createdAt: "desc" },
        select: { customerName: true }
      });

      if (distinctThreadIdentity?.customerName) {
        customerName = distinctThreadIdentity.customerName;
      } else {
        // Look up against the main secure user profile credentials table if no chat history exists yet
        const activeProfileRecord = await prisma.user.findUnique({
          where: { id: customerId },
          select: { name: true }
        });
        customerName = activeProfileRecord?.name || "Authenticated Client";
      }
    }

    // Single source commit to prevent multi-insertion collisions 
    const archivedMessage = await prisma.messages.create({
      data: { 
        customerId, 
        customerName: customerName || "Guest Buyer", 
        sender, 
        text,
        read: false 
      },
    });

    return NextResponse.json(archivedMessage, { status: 201 });
  } catch (error) {
    console.error("Exception in POST /api/messages:", error);
    return NextResponse.json({ message: "Failed to persist chat message" }, { status: 500 });
  }
}

// ==========================================
// PUT: Standalone endpoint to clear unread metrics
// ==========================================
export async function PUT(request) {
  try {
    const { customerId, viewer } = await request.json();

    if (!customerId || !viewer) {
      return NextResponse.json({ message: "Missing payload data parameters" }, { status: 400 });
    }

    const targetSender = viewer === "ADMIN" ? "CUSTOMER" : "ADMIN";

    await prisma.messages.updateMany({
      where: {
        customerId: customerId,
        sender: targetSender,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ success: true, message: "Messages successfully marked as read" });
  } catch (error) {
    console.error("Exception in PUT /api/messages:", error);
    return NextResponse.json({ message: "Failed updating message read attributes" }, { status: 500 });
  }
}