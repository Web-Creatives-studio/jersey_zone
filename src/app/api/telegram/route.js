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

    const orderModel = prisma.orders || prisma.order;
    const productModel = prisma.products || prisma.product;

    // =========================================================================
    // 1. HANDLE INLINE BUTTON ACTIONS (Mark Processing, Mark Shipped)
    // =========================================================================
    if (body.callback_query) {
      const callback = body.callback_query;
      const data = callback.data;
      const callbackId = callback.id;

      if (data.startsWith("proc_")) {
        const orderId = data.replace("proc_", "");

        await orderModel.update({
          where: { id: orderId },
          data: { status: "Processing" },
        });

        await answerTelegramCallback(callbackId, "Order marked as Processing!");
        await sendTelegramAdminNotification(
          `✅ <b>Order #${orderId}</b> status changed to <b>Processing</b>.`
        );
      } else if (data.startsWith("ship_")) {
        const orderId = data.replace("ship_", "");

        await orderModel.update({
          where: { id: orderId },
          data: { status: "Shipped" },
        });

        await answerTelegramCallback(callbackId, "Order marked as Shipped!");
        await sendTelegramAdminNotification(
          `🚚 <b>Order #${orderId}</b> status changed to <b>Shipped</b>.`
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

    // Security check
    if (
      String(message.chat.id) !== String(process.env.TELEGRAM_ADMIN_CHAT_ID)
    ) {
      return NextResponse.json({ error: "Unauthorized Chat" }, { status: 401 });
    }

    // COMMAND: /orders
    if (text === "/orders" || text === "/pending") {
      const pendingOrders = await orderModel.findMany({
        where: { status: "Pending" },
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
                text: "⚙️ Mark Processing",
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

    // COMMAND: /stock
    else if (text === "/stock") {
      const products = await productModel.findMany();
      let lowStockCount = 0;
      let reportText = "📊 <b>INVENTORY & STOCK REPORT</b>\n\n";

      products.forEach((prod) => {
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
        `• /orders - View pending orders & mark as processing/shipped\n` +
        `• /stock - View low inventory stock warnings`;

      await sendTelegramAdminNotification(helpText);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram Webhook Failure:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}