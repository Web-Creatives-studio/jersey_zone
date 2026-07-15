import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { sendEmail } from '../../lib/email';
import { toast } from 'react-toastify'; // Standardized Notification UI

// 🌟 THE FIX (Severless Guard): Prevent Next.js from caching or static optimizing this Cron route
export const dynamic = 'force-dynamic';

export async function GET(req) {
  // 🛡️ CRON AUTH GUARD: Stop random public requests from triggering email billing spend
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("Unauthorized Cron Attempt Blocked: Missing CRON_SECRET");
    return new Response('Unauthorized Request Blocked', { status: 401 });
  }

  const now = new Date();
  const successfulQueueLogs = [];
  const failedQueueLogs = [];

  try {
    // =========================================================================
    // 1. PROCESS STANDARD DELAYED QUEUE ENTRIES (Optimized)
    // =========================================================================
    const pendingQueueItems = await prisma.emailQueue.findMany({
      where: { isProcessed: false, processAfter: { lte: now } },
      include: { automation: true },
    });

    if (pendingQueueItems.length > 0) {
      // Loop through queue items...
      for (const item of pendingQueueItems) {
        if (!item.automation.isActive) continue;

        let html = item.automation.htmlContent;
        // Use fallbacks for safety if dynamicData is missing schema entries
        const data = item.dynamicData || {}; 
        
        // Inject variables structure
        Object.keys(data).forEach((key) => {
          html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
        });

        try {
          // A. Trigger Email Service payload send (Awaited)
          await sendEmail({
            to: item.recipient,
            subject: item.automation.subject,
            html,
            images: item.automation.images // Structured flat images string
          });

          // B. Add success payload logs to intermediate state array
          successfulQueueLogs.push({
            automationId: item.automationId,
            recipient: item.recipient,
            status: 'SENT',
          });
        } catch (err) {
          // Add failure payload logs to intermediate state array
          console.error(`Failed to process queue item ${item.id} -> ${item.recipient}:`, err);
          failedQueueLogs.push({
            automationId: item.automationId,
            recipient: item.recipient,
            status: 'FAILED',
          });
        }
      }

      // 🌟 PERFORMANCE OPTIMIZATION (Bulk Writes): Sync logs in bulk rather than inside the loop
      if (successfulQueueLogs.length > 0 || failedQueueLogs.length > 0) {
        // Run as a atomic transaction boundary
        await prisma.$transaction([
          // Update queue line status bulk
          prisma.emailQueue.updateMany({
            where: {
              id: {
                in: pendingQueueItems.map(item => item.id)
              }
            },
            data: { isProcessed: true }
          }),
          // Write final execution logs bulk (Highly optimized)
          prisma.emailLog.createMany({
            data: [...successfulQueueLogs, ...failedQueueLogs],
            skipDuplicates: true // Schema Guard against race conditions
          })
        ]);
      }
    }

    // =========================================================================
    // 2. PROCESS ONE-OFF FIXED SCHEDULED AUTOMATIONS (Refactored Bulk Handling)
    // =========================================================================
    const scheduledAutomations = await prisma.emailAutomation.findMany({
      where: {
        triggerType: 'SCHEDULED',
        isActive: true,
        scheduledFor: { lte: now },
        // Ensure we haven't already processed this one-off campaign structure
        EmailLog: { none: {} } 
      }
    });

    if (scheduledAutomations.length > 0) {
      // 🌟 BULK DATA PREP: Fetch subscribers globally rather than inside the automation loop
      const subscribers = await prisma.subscriber.findMany({ where: { isActive: true } });

      if (subscribers.length > 0) {
        for (const auto of scheduledAutomations) {
          const bulkLogBatch = [];

          // Second Nested Loop -> MUST BE OPTIMIZED
          for (const sub of subscribers) {
            // Apply name fallback safely if sub.name property is blank structure
            const normalizedHtml = auto.htmlContent.replace(/{{name}}/g, sub.name?.trim() || 'Customer');
            
            try {
              // A. Trigger Email Service send payload (Awaited per subscriber)
              await sendEmail({
                to: sub.email,
                subject: auto.subject,
                html: normalizedHtml,
                images: auto.images
              });

              // B. Buffer log payload in intermediate state array
              bulkLogBatch.push({
                automationId: auto.id,
                recipient: sub.email,
                status: 'SENT'
              });
            } catch (err) {
              console.error(`Scheduled Automation Send Failure (${auto.id} -> ${sub.email}):`, err);
              bulkLogBatch.push({
                automationId: auto.id,
                recipient: sub.email,
                status: 'FAILED'
              });
            }
          }

          // 🌟 PERFORMANCE OPTIMIZATION (createMany): Write all logs for this automation campaign at once
          if (bulkLogBatch.length > 0) {
            await prisma.emailLog.createMany({
              data: bulkLogBatch,
              skipDuplicates: true
            });
          }
        }
      }
    }

    // Return sanitized execution final state structure
    return NextResponse.json({
      success: true,
      processedDelayedItems: pendingQueueItems.length,
      executedScheduledCampaigns: scheduledAutomations.length
    });
  } catch (error) {
    // Capture runtime DB error stack trace context safely
    console.error("Critical CRON Database Execution Failure:", error);
    return NextResponse.json({ error: "Internal Secure DB CRON processing error payload write failure" }, { status: 500 });
  }
}