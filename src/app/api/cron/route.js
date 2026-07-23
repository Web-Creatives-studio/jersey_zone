import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { sendEmail } from '../../lib/email';

// 🌟 SERVERLESS GUARD: Prevent Next.js from caching or static optimizing this Cron route
export const dynamic = 'force-dynamic';

export async function GET(req) {
  // 🛡️ CRON AUTH GUARD: Stop random public requests from triggering email billing spend
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('Unauthorized Cron Attempt Blocked: Missing or invalid CRON_SECRET');
    return new Response('Unauthorized Request Blocked', { status: 401 });
  }

  const now = new Date();
  const successfulQueueLogs = [];
  const failedQueueLogs = [];
  const successfulQueueItemIds = [];

  try {
    // =========================================================================
    // 1. PROCESS STANDARD DELAYED QUEUE ENTRIES (Optimized)
    // =========================================================================
    const pendingQueueItems = await prisma.emailQueue.findMany({
      where: { isProcessed: false, processAfter: { lte: now } },
      include: { automation: true },
    });

    if (pendingQueueItems.length > 0) {
      for (const item of pendingQueueItems) {
        if (!item.automation || !item.automation.isActive) continue;

        let html = item.automation.htmlContent || '';
        // Use fallbacks for safety if dynamicData is missing
        const data = item.dynamicData || {};

        // Inject dynamic template variables (e.g. {{name}}, {{orderId}})
        Object.keys(data).forEach((key) => {
          html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
        });

        try {
          // A. Trigger Email Service payload send
          await sendEmail({
            to: item.recipient,
            subject: item.automation.subject,
            html,
            images: item.automation.images,
          });

          // B. Track successful items for selective queue updates
          successfulQueueItemIds.push(item.id);
          successfulQueueLogs.push({
            automationId: item.automationId,
            recipient: item.recipient,
            status: 'SENT',
          });
        } catch (err) {
          console.error(`Failed to process queue item ${item.id} -> ${item.recipient}:`, err);
          failedQueueLogs.push({
            automationId: item.automationId,
            recipient: item.recipient,
            status: 'FAILED',
          });
        }
      }

      // 🌟 PERFORMANCE & RELIABILITY OPTIMIZATION: Atomic Bulk Transaction
      if (successfulQueueLogs.length > 0 || failedQueueLogs.length > 0) {
        const transactionOperations = [];

        // Only mark items as processed if the email was successfully sent
        if (successfulQueueItemIds.length > 0) {
          transactionOperations.push(
            prisma.emailQueue.updateMany({
              where: {
                id: { in: successfulQueueItemIds },
              },
              data: { isProcessed: true },
            })
          );
        }

        // Log both SENT and FAILED attempts for full audit visibility
        const allLogs = [...successfulQueueLogs, ...failedQueueLogs];
        if (allLogs.length > 0) {
          transactionOperations.push(
            prisma.emailLog.createMany({
              data: allLogs,
              skipDuplicates: true,
            })
          );
        }

        if (transactionOperations.length > 0) {
          await prisma.$transaction(transactionOperations);
        }
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
        // Ensure we haven't already processed this campaign
        EmailLog: { none: {} },
      },
    });

    if (scheduledAutomations.length > 0) {
      // Fetch active subscribers globally
      const subscribers = await prisma.subscriber.findMany({
        where: { isActive: true },
      });

      if (subscribers.length > 0) {
        for (const auto of scheduledAutomations) {
          const bulkLogBatch = [];

          for (const sub of subscribers) {
            const normalizedHtml = (auto.htmlContent || '').replace(
              /{{name}}/g,
              sub.name?.trim() || 'Customer'
            );

            try {
              await sendEmail({
                to: sub.email,
                subject: auto.subject,
                html: normalizedHtml,
                images: auto.images,
              });

              bulkLogBatch.push({
                automationId: auto.id,
                recipient: sub.email,
                status: 'SENT',
              });
            } catch (err) {
              console.error(
                `Scheduled Automation Send Failure (${auto.id} -> ${sub.email}):`,
                err
              );
              bulkLogBatch.push({
                automationId: auto.id,
                recipient: sub.email,
                status: 'FAILED',
              });
            }
          }

          // Write all campaign logs in bulk per automation
          if (bulkLogBatch.length > 0) {
            await prisma.emailLog.createMany({
              data: bulkLogBatch,
              skipDuplicates: true,
            });
          }
        }
      }
    }

    // Return final execution summary
    return NextResponse.json({
      success: true,
      processedDelayedItems: successfulQueueItemIds.length,
      failedDelayedItems: failedQueueLogs.length,
      executedScheduledCampaigns: scheduledAutomations.length,
    });
  } catch (error) {
    console.error('Critical CRON Execution Failure:', error);
    return NextResponse.json(
      { error: 'Internal CRON execution failure' },
      { status: 500 }
    );
  }
}

