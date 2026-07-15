// src/lib/socket.js
import { io } from "socket.io-client";

// Ensure Next.js explicitly directs socket traffic to port 3001
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"], 
  
  // Force try direct protocols cleanly
});