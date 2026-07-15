// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { Client } = require("pg");
require("dotenv").config({ path: ".env" }); // Forces loading from your local Next.js environment file

const app = express();
app.use(cors());

const server = http.createServer(app);

// 1. Initialize Socket.io with Cross-Origin Resource Sharing (CORS) configurations
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000", // Next.js App URL
    methods: ["GET", "POST"],
  },
});

// 2. Setup standard PostgreSQL client to log backups directly to your DB
// =======================================================================
// 2. Setup standard PostgreSQL client to log backups directly to your DB
// =======================================================================

// Robust fallback: If dotenv struggles with quotes, manually ensure it reads a string
const dbConnectionString = process.env.DATABASE_URL;

if (!dbConnectionString) {
  console.error("❌ CRITICAL ERROR: DATABASE_URL is undefined inside server.js!");
  console.error("Please check that your .env.local file exists at the root directory.");
  process.exit(1);
}

const pgClient = new Client({
  connectionString: dbConnectionString,
  // Add a connection timeout guard so it doesn't hang indefinitely
  connectionTimeoutMillis: 5000 
});

pgClient.connect()
  .then(() => console.log("💾 Socket Server connected to PostgreSQL successfully!"))
  .catch((err) => {
    console.error("❌ Socket Server Database Connection Error:");
    console.error(err.message);
    console.log("\n💡 Troubleshooting Tip: Make sure your password doesn't contain unescaped special characters, and verify that your Next.js app isn't using a different password formatting schema.");
  });



// 3. Real-Time WebSocket Channel Pipelines
io.on("connection", (socket) => {
  console.log(`⚡ Connected active pipeline session: ${socket.id}`);

  // 📥 Listen for live inbound chat messages (Admins or Customers)
  socket.on("send_message", async (payload) => {
    const { customerId, sender, text } = payload;

    // Broadcast the payload out to all OTHER active connected socket sessions instantly
    socket.broadcast.emit("receive_message", payload);

    // Fallback Background DB Sync: Persist message directly to PostgreSQL in case HTTP endpoint drops
    try {
      const generatedId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      await pgClient.query(
        'INSERT INTO "messages" (id, "customerId", sender, text, "createdAt", read) VALUES ($1, $2, $3, $4, NOW(), false) ON CONFLICT DO NOTHING',
        [generatedId, customerId, sender, text]
      );
    } catch (err) {
      console.error("⚠️ Background DB Write Dropped:", err.message);
    }
  });

  // 📥 Listen for live message read notifications
  socket.on("mark_read", ({ customerId, viewer }) => {
    // Notify the other participant's screen to update their unread UI counts in real-time
    socket.broadcast.emit("messages_read", { customerId, viewer });
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Disconnected pipeline session: ${socket.id}`);
  });
});

// 4. Start the Standalone WebSocket Engine
const PORT = process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Standalone WebSocket Server running smoothly on port ${PORT}`);
});