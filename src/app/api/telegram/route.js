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
    // 1. INLINE BUTTON CALLBACKS (Status Toggles)
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

        await answerTelegramCallback(callbackId, "Marked as Processing!");
        await sendTelegramAdminNotification(
          `⚙️ <b>Order #${orderId}</b> status updated to <b>Processing</b>.`
        );
      } else if (data.startsWith("ship_")) {
        const orderId = data.replace("ship_", "");

        await orderModel.update({
          where: { id: orderId },
          data: { status: "Shipped" },
        });

        await answerTelegramCallback(callbackId, "Marked as Shipped!");
        await sendTelegramAdminNotification(
          `🚚 <b>Order #${orderId}</b> status updated to <b>Shipped</b>.`
        );
      } else if (data.startsWith("deliv_")) {
        const orderId = data.replace("deliv_", "");

        await orderModel.update({
          where: { id: orderId },
          data: { status: "Delivered" },
        });

        await answerTelegramCallback(callbackId, "Marked as Delivered!");
        await sendTelegramAdminNotification(
          `✅ <b>Order #${orderId}</b> status updated to <b>Delivered</b>.`
        );
      }

      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // 2. COMMAND & KEYBOARD MESSAGE HANDLER
    // =========================================================================
    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const text = message.text.trim();

    // Security Check: Restrict to authorized admin chat ID
    if (
      String(message.chat.id) !== String(process.env.TELEGRAM_ADMIN_CHAT_ID)
    ) {
      return NextResponse.json({ error: "Unauthorized Chat" }, { status: 401 });
    }

    // -------------------------------------------------------------------------
    // COMMAND: /orders or Keyboard "📦 Pending Orders"
    // -------------------------------------------------------------------------
    if (
      text === "/orders" ||
      text === "/pending" ||
      text === "📦 Pending Orders"
    ) {
      const pendingOrders = await orderModel.findMany({
        where: { status: "Pending" },
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      if (!pendingOrders || pendingOrders.length === 0) {
        await sendTelegramAdminNotification("🎉 No pending orders right now!");
        return NextResponse.json({ ok: true });
      }

      for (const order of pendingOrders) {
        // Parse JSON items
        let itemsListText = "";
        const rawItems = Array.isArray(order.items)
          ? order.items
          : typeof order.items === "string"
          ? JSON.parse(order.items || "[]")
          : [];

        rawItems.forEach((item, idx) => {
          const name = item.name || item.title || "Jersey";
          const size = item.size ? ` (${item.size})` : "";
          const color = item.color ? ` - ${item.color}` : "";
          const qty = item.quantity || item.qty || 1;
          const price = item.price ? ` @ $${Number(item.price).toFixed(2)}` : "";

          itemsListText += `  ${idx + 1}. <b>${name}</b>${size}${color} x${qty}${price}\n`;
        });

        // Parse JSON Shipping Address
        const addr =
          typeof order.shippingAddress === "string"
            ? JSON.parse(order.shippingAddress || "{}")
            : order.shippingAddress || {};

        const formattedAddress = [
          addr.street || addr.address || addr.addressLine1,
          addr.city,
          addr.state,
          addr.country,
        ]
          .filter(Boolean)
          .join(", ") || "No address specified";

        const messageText =
          `📦 <b>PENDING ORDER DETAILS</b>\n` +
          `━━━━━━━━━━━━━━━━━━━\n` +
          `🆔 <b>Order ID:</b> <code>#${order.id}</code>\n` +
          `👤 <b>Customer:</b> ${order.customerName || "Guest"}\n` +
          `✉️ <b>Email:</b> ${order.customerEmail || "N/A"}\n` +
          `💳 <b>Payment Status:</b> ${order.paymentStatus || "Unpaid"}\n\n` +
          `🛒 <b>Items Ordered:</b>\n${itemsListText || "  No items listed"}\n` +
          `📍 <b>Shipping Address:</b>\n<i>${formattedAddress}</i>\n\n` +
          `💰 <b>Subtotal:</b> $${Number(order.subtotal || 0).toFixed(2)}\n` +
          `🚚 <b>Shipping:</b> $${Number(order.shipping || 0).toFixed(2)}\n` +
          `💵 <b>Total Amount:</b> <b>$${Number(order.totalAmount || 0).toFixed(2)}</b>\n` +
          `📅 <b>Date:</b> ${new Date(order.createdAt || order.date).toLocaleString()}`;

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
            [
              {
                text: "✅ Mark Delivered",
                callback_data: `deliv_${order.id}`,
              },
            ],
          ],
        };

        await sendTelegramAdminNotification(messageText, inlineKeyboard);
      }
    }

    // -------------------------------------------------------------------------
    // COMMAND: /stock or Keyboard "📊 Inventory Stock"
    // -------------------------------------------------------------------------
    else if (text === "/stock" || text === "📊 Inventory Stock") {
      const products = await productModel.findMany();
      let lowStockCount = 0;
      let reportText = "📊 <b>INVENTORY & STOCK REPORT</b>\n━━━━━━━━━━━━━━━━━━━\n\n";

      products.forEach((prod) => {
        // 1. Top-Level Stock Check
        if (typeof prod.stock === "number" && prod.stock <= 3) {
          lowStockCount++;
          reportText += `⚠️ <b>${prod.name}</b>: Total stock is <b>${prod.stock} unit(s) left</b>\n`;
        }

        // 2. Nested Variant Sizes Check
        if (prod.sizes) {
          try {
            const sizesMap =
              typeof prod.sizes === "string"
                ? JSON.parse(prod.sizes)
                : prod.sizes;

            if (typeof sizesMap === "object" && sizesMap !== null) {
              Object.keys(sizesMap).forEach((key) => {
                const val = sizesMap[key];
                if (typeof val === "number" && val <= 3) {
                  lowStockCount++;
                  reportText += `⚠️ <b>${prod.name}</b> (${key.toUpperCase()}): <b>${val} left</b>\n`;
                } else if (typeof val === "object" && val !== null) {
                  Object.keys(val).forEach((size) => {
                    const count = val[size];
                    if (typeof count === "number" && count <= 3) {
                      lowStockCount++;
                      reportText += `⚠️ <b>${prod.name}</b> (${key} / ${size.toUpperCase()}): <b>${count} left</b>\n`;
                    }
                  });
                }
              });
            }
          } catch (e) {
            // Safe JSON parse fallback
          }
        }
      });

      if (lowStockCount === 0) {
        reportText += "✅ All product inventory stocks are healthy (> 3 units).";
      }

      await sendTelegramAdminNotification(reportText);
    }

    // -------------------------------------------------------------------------
    // COMMAND: /stats or Keyboard "📈 Revenue Stats"
    // -------------------------------------------------------------------------
    else if (text === "/stats" || text === "📈 Revenue Stats") {
      const allOrders = await orderModel.findMany();
      const pendingCount = allOrders.filter((o) => o.status === "Pending").length;

      let totalRevenue = 0;
      allOrders.forEach((o) => {
        totalRevenue += Number(o.totalAmount || 0);
      });

      const statsText =
        `📈 <b>STORE ANALYTICS OVERVIEW</b>\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `📦 <b>Total Orders:</b> ${allOrders.length}\n` +
        `⏳ <b>Pending Orders:</b> ${pendingCount}\n` +
        `💵 <b>Gross Revenue:</b> $${totalRevenue.toFixed(2)}`;

      await sendTelegramAdminNotification(statsText);
    }

    // -------------------------------------------------------------------------
    // COMMAND: /start or /help (Interactive Reply Keyboard)
    // -------------------------------------------------------------------------
    else if (text === "/start" || text === "/help") {
      const startText =
        `🤖 <b>JERSEY ZONE ADMIN BOT LIVE</b>\n\n` +
        `Select an action below or type slash commands:\n` +
        `• /orders - View detailed pending orders & status buttons\n` +
        `• /stock - Low stock inventory alerts\n` +
        `• /stats - Total store revenue & order metrics`;

      const replyKeyboard = {
        keyboard: [
          [{ text: "📦 Pending Orders" }, { text: "📊 Inventory Stock" }],
          [{ text: "📈 Revenue Stats" }],
        ],
        resize_keyboard: true,
      };

      await sendTelegramAdminNotification(startText, replyKeyboard);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram Webhook Failure:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}