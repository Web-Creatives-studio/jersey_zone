import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

// GET: Fetch all notifications for a specific user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "userId is required" }, { status: 400 });
    }

    const notifications = await prisma.userNotifications.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Failed fetching notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Mark single notification or ALL notifications as read
export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, notificationId, markAllRead } = body;

    if (!userId) {
      return NextResponse.json({ message: "userId parameter required" }, { status: 400 });
    }

    if (markAllRead) {
      await prisma.userNotifications.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ message: "All notifications marked as read." });
    }

    if (notificationId) {
      const updated = await prisma.userNotifications.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ message: "Invalid payload parameters" }, { status: 400 });
  } catch (error) {
    console.error("Failed updating notifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Purge a single notification or clear all read
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (notificationId) {
      await prisma.userNotifications.delete({
        where: { id: notificationId },
      });
      return NextResponse.json({ message: "Notification deleted." });
    }

    if (userId) {
      await prisma.userNotifications.deleteMany({
        where: { userId },
      });
      return NextResponse.json({ message: "All notifications cleared." });
    }

    return NextResponse.json({ message: "Missing deletion parameters" }, { status: 400 });
  } catch (error) {
    console.error("Failed deleting notification:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}