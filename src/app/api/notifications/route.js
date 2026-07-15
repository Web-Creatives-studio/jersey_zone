import { NextResponse } from "next/server";
import pg from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  // Listen only to the calculated notifications stream channel
  await client.query("LISTEN new_notification_stream");

  client.on("notification", async (msg) => {
    try {
      await writer.write(encoder.encode(`data: ${msg.payload}\n\n`));
    } catch (e) {
      console.error("Stream sync disruption", e);
    }
  });

  const heartbeat = setInterval(async () => {
    try { await writer.write(encoder.encode(": heartbeat\n\n")); } 
    catch { clearInterval(heartbeat); client.end(); }
  }, 15000);

  return new NextResponse(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}