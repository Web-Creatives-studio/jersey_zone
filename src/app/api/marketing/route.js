import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma'; // Adjust your prisma client import location

// GET ALL AUTOMATIONS
export async function GET() {
  try {
    const automations = await prisma.emailAutomation.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(automations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch automation rules' }, { status: 500 });
  }
}

// CREATE OR EDIT AUTOMATION (Upsert pattern)
export async function POST(req) {
  try {
    const body = await req.json();
    const { id, name, category, subject, htmlContent, images, triggerType, delayInHours, scheduledFor, isActive } = body;

    const automationData = {
      name,
      category,
      subject,
      htmlContent,
      images: images || [],
      triggerType,
      delayInHours: triggerType === 'DELAYED' ? parseInt(delayInHours) : 0,
      scheduledFor: triggerType === 'SCHEDULED' ? new Date(scheduledFor) : null,
      isActive: isActive !== undefined ? isActive : true,
    };

    if (id) {
      // EDIT PIPELINE MODE
      const updated = await prisma.emailAutomation.update({
        where: { id },
        data: automationData,
      });
      return NextResponse.json(updated);
    } else {
      // CREATE NEW MODE
      const created = await prisma.emailAutomation.create({
        data: automationData,
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Processing engine write failed' }, { status: 500 });
  }
}