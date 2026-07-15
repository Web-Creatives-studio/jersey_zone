import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { sendEmail } from '../../lib/email';

export async function GET(req) {
  const now = new Date();

  try {
    // 1. Process standard Delayed Queue entries
    const pendingQueueItems = await prisma.emailQueue.findMany({
      where: { isProcessed: false, processAfter: { lte: now } },
      include: { automation: true },
    });

    for (const item of pendingQueueItems) {
      if (!item.automation.isActive) continue;

      let html = item.automation.htmlContent;
      const data = item.dynamicData ;
      
      // Inject variables
      Object.keys(data).forEach((key) => {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
      });

      try {
        await sendEmail({
          to: item.recipient,
          subject: item.automation.subject,
          html,
          images: item.automation.images
        });

        await prisma.$transaction([
          prisma.emailQueue.update({ where: { id: item.id }, data: { isProcessed: true } }),
          prisma.emailLog.create({ data: { automationId: item.automationId, recipient: item.recipient, status: 'SENT' } })
        ]);
      } catch (err) {
        await prisma.emailLog.create({ data: { automationId: item.automationId, recipient: item.recipient, status: 'FAILED' } });
      }
    }

    // 2. Process One-Off Fixed SCHEDULED Automations that haven't been queued yet
    const scheduledAutomations = await prisma.emailAutomation.findMany({
      where: {
        triggerType: 'SCHEDULED',
        isActive: true,
        scheduledFor: { lte: now },
        // Ensure we haven't already processed this one-off campaign
        EmailLog: { none: {} } 
      }
    });

    for (const auto of scheduledAutomations) {
      // Fetch subscribers from your existing platform user table
      const subscribers = await prisma.subscriber.findMany({ where: { isActive: true } });

      for (const sub of subscribers) {
        const structuralHtml = auto.htmlContent.replace(/{{name}}/g, sub.name || 'Customer');
        try {
          await sendEmail({ to: sub.email, subject: auto.subject, html: structuralHtml, images: auto.images });
          await prisma.emailLog.create({ data: { automationId: auto.id, recipient: sub.email, status: 'SENT' } });
        } catch {
          await prisma.emailLog.create({ data: { automationId: auto.id, recipient: sub.email, status: 'FAILED' } });
        }
      }
    }

    return NextResponse.json({ success: true, executedQueueCount: pendingQueueItems.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}