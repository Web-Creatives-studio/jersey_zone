import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import {
  sendTelegramAdminNotification,
  answerTelegramCallback,
} from "../../lib/telgram";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();

    // =========================================================================
    // 1. HANDLE INLINE BUTTON ACTIONS (Mark Processed, Mark Shipped, etc.)
    // =========================================================================
    if (body.callback_query) {
      const callback = body.callback_query;
      const data = callback.data; // e.g. "proc_ORD-12345" or "ship_ORD-12345"
      const callbackId = callback.id;

      if (data.startsWith("proc_")) {
        const orderId = data.replace("proc_", "");

        // Update database status
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "PROCESSED" },
        });

        await answerTelegramCallback(callbackId, "Order marked as PROCESSED!");
        await sendTelegramAdminNotification(
          `✅ <b>Order #${orderId}</b> status changed to <b>PROCESSED</b>.`,
        );
      } else if (data.startsWith("ship_")) {
        const orderId = data.replace("ship_", "");

        // Update database status
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "SHIPPED" },
        });

        await answerTelegramCallback(callbackId, "Order marked as SHIPPED!");
        await sendTelegramAdminNotification(
          `🚚 <b>Order #${orderId}</b> status changed to <b>SHIPPED</b>.`,
        );
      }

      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // 2. HANDLE COMMAND MESSAGES (/orders, /stock, /help)
    // =========================================================================
    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const text = message.text.trim();

    // Security Guard: Verify request comes from your Telegram Chat ID
    if (
      String(message.chat.id) !== String(process.env.TELEGRAM_ADMIN_CHAT_ID)
    ) {
      return NextResponse.json({ error: "Unauthorized Chat" }, { status: 401 });
    }

    // COMMAND: /orders (List Pending Orders)
    if (text === "/orders" || text === "/pending") {
      const pendingOrders = await prisma.orders.findMany({
        where: { status: "PENDING" },
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      if (pendingOrders.length === 0) {
        await sendTelegramAdminNotification("🎉 No pending orders right now!");
        return NextResponse.json({ ok: true });
      }

      for (const order of pendingOrders) {
        const messageText =
          `📦 <b>PENDING ORDER #${order.id}</b>\n` +
          `👤 <b>Customer:</b> ${order.customerName || "Guest"}\n` +
          `💵 <b>Total:</b> $${Number(order.totalAmount || 0).toFixed(2)}\n` +
          `📅 <b>Date:</b> ${new Date(order.createdAt).toLocaleString()}`;

        const inlineKeyboard = {
          inline_keyboard: [
            [
              {
                text: "⚙️ Mark Processed",
                callback_data: `proc_${order.id}`,
              },
              {
                text: "🚚 Mark Shipped",
                callback_data: `ship_${order.id}`,
              },
            ],
          ],
        };

        await sendTelegramAdminNotification(messageText, inlineKeyboard);
      }
    }

    // COMMAND: /stock (Check Inventory & Low Stock Variants)
    else if (text === "/stock") {
      const products = await prisma.products.findMany();
      let lowStockCount = 0;
      let reportText = "📊 <b>INVENTORY & STOCK REPORT</b>\n\n";

      products.forEach((prod) => {
        // Parse variant stock json structure if exists
        const sizesMap = prod.sizes || {};
        Object.keys(sizesMap).forEach((color) => {
          Object.keys(sizesMap[color] || {}).forEach((size) => {
            const stock = sizesMap[color][size];
            if (stock <= 3) {
              lowStockCount++;
              reportText += `⚠️ <b>${prod.name}</b> (${color} / ${size.toUpperCase()}): <b>${stock} left</b>\n`;
            }
          });
        });
      });

      if (lowStockCount === 0) {
        reportText += "✅ All product variant stocks are healthy (> 3 units).";
      }

      await sendTelegramAdminNotification(reportText);
    }

    // DEFAULT COMMAND LIST
    else if (text === "/start" || text === "/help") {
      const helpText =
        `🤖 <b>JERSEY ZONE ADMIN BOT</b>\n\n` +
        `Available Commands:\n` +
        `• /orders - View pending orders & mark as processed/shipped\n` +
        `• /stock - View low inventory stock warnings`;

      await sendTelegramAdminNotification(helpText);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram Webhook Failure:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
