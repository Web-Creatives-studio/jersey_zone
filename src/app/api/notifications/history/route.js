import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const historicalLogs = await prisma.notifications.findMany({
      orderBy: { createdAt: "desc" },
      take: 50 
    });
    return NextResponse.json({ success: true, logs: historicalLogs });
  } catch (err) {
    return NextResponse.json({ error: "Failed fetching log records" }, { status: 500 });
  }
}