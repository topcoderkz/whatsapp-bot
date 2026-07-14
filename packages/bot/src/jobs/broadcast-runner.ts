import { PrismaClient } from '@prisma/client';
import { whatsappClient, WhatsAppApiError } from '../whatsapp/client';
import { config } from '../config';
import { sanitizeBroadcastParam } from '../services/broadcast-sanitize';

// Plain client (no soft-delete extension) — same pattern as booking-cleanup.ts.
const jobPrisma = new PrismaClient();

// Meta tier-1 marketing cap is 1,000 unique-user conversations / rolling 24h.
// We stop at 900 to leave headroom for booking_notification / lead-alert traffic
// that also counts against the same pool. Tunable via env for higher tiers.
const DAILY_MARKETING_CAP = parseInt(process.env.BROADCAST_DAILY_CAP || '900', 10);

// How many recipients we attempt per runner tick. Keep small so a burst of
// snapshotted recipients doesn't monopolize the process for minutes — the
// runner will fire again in a minute and pick up where it left off.
const BATCH_SIZE = 50;

// Cadence of the recurring tick.
const RUNNER_INTERVAL_MS = 60 * 1000;

// Guard against overlapping runs — one tick can outlast the interval if the
// batch stalls on network. Skip until the previous run finishes.
let running = false;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function marketingSentInLast24h(): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  // Every successful send (from broadcasts + template notifications) counts.
  // We proxy this via broadcast_recipients — booking_notification / lead
  // alerts don't currently go through broadcast_messages, so this
  // under-counts by that traffic. Acceptable — Meta enforces the real cap
  // anyway, we just want a soft brake on our own runaway.
  return (jobPrisma as any).broadcastRecipient.count({
    where: {
      status: { in: ['SENT', 'DELIVERED', 'READ'] },
      sentAt: { gte: since },
    },
  });
}

/**
 * Send one recipient. Returns true if sent (SENT), false if failed and moved on.
 * Updates the broadcast_recipients row in place.
 */
async function sendToRecipient(recipient: any, broadcast: any): Promise<boolean> {
  const templateName = broadcast.templateName || config.templates.broadcast;
  const rawVars: string[] = Array.isArray(broadcast.templateVariables)
    ? (broadcast.templateVariables as string[])
    : [broadcast.messageText];
  const sanitized = rawVars.map((v) => sanitizeBroadcastParam(v ?? ''));

  const attemptStart = new Date();
  try {
    const result = await whatsappClient.sendTemplate(recipient.phone, templateName, sanitized);
    await (jobPrisma as any).broadcastRecipient.update({
      where: { id: recipient.id },
      data: {
        status: 'SENT',
        attempts: { increment: 1 },
        lastAttemptAt: attemptStart,
        sentAt: attemptStart,
        waMessageId: result.messageId,
        errorCode: null,
        errorMessage: null,
      },
    });
    // Mirror into notification_logs so the /notifications page still shows history.
    await (jobPrisma as any).notificationLog.create({
      data: {
        broadcastId: broadcast.id,
        recipientPhone: recipient.phone,
        templateName,
        status: 'SENT',
        waMessageId: result.messageId,
        sentAt: attemptStart,
      },
    });
    return true;
  } catch (err) {
    const isPermanent = err instanceof WhatsAppApiError && err.isPermanent;
    const code = err instanceof WhatsAppApiError ? err.code : null;
    const message = (err as Error).message ?? 'Unknown error';
    await (jobPrisma as any).broadcastRecipient.update({
      where: { id: recipient.id },
      data: {
        status: isPermanent ? 'FAILED_PERMANENT' : 'FAILED_RETRY',
        attempts: { increment: 1 },
        lastAttemptAt: attemptStart,
        errorCode: code,
        errorMessage: message,
      },
    });
    await (jobPrisma as any).notificationLog.create({
      data: {
        broadcastId: broadcast.id,
        recipientPhone: recipient.phone,
        templateName,
        status: 'FAILED',
        errorMessage: message,
      },
    });
    return false;
  }
}

/**
 * Close out a broadcast if no more work remains. A "done" campaign has zero
 * PENDING and zero FAILED_RETRY rows — everything's been either delivered or
 * permanently failed or skipped.
 */
async function markCompletedIfDone(broadcastId: number) {
  const remaining = await (jobPrisma as any).broadcastRecipient.count({
    where: { broadcastId, status: { in: ['PENDING', 'FAILED_RETRY'] } },
  });
  if (remaining === 0) {
    const grouped = await (jobPrisma as any).broadcastRecipient.groupBy({
      by: ['status'],
      where: { broadcastId },
      _count: { _all: true },
    });
    let sent = 0;
    let failed = 0;
    for (const g of grouped) {
      const count: number = g._count._all;
      if (g.status === 'SENT' || g.status === 'DELIVERED' || g.status === 'READ') sent += count;
      else if (g.status === 'FAILED_PERMANENT') failed += count;
    }
    await (jobPrisma as any).broadcastMessage.update({
      where: { id: broadcastId },
      data: {
        status: sent > 0 ? 'SENT' : 'FAILED',
        sentCount: sent,
        failedCount: failed,
        sentAt: new Date(),
      },
    });
  }
}

/**
 * One tick of the runner. Picks up all SENDING broadcasts and works through
 * a batch of their recipients, respecting the soft daily cap.
 */
export async function runOnce(): Promise<void> {
  if (running) return;
  running = true;
  try {
    const alreadySent = await marketingSentInLast24h();
    const remainingBudget = Math.max(0, DAILY_MARKETING_CAP - alreadySent);
    if (remainingBudget === 0) {
      console.log(`[BroadcastRunner] Daily cap ${DAILY_MARKETING_CAP} reached — sleeping until quota rolls`);
      return;
    }

    const activeBroadcasts = await (jobPrisma as any).broadcastMessage.findMany({
      where: { status: 'SENDING' },
      orderBy: { createdAt: 'asc' },
    });
    if (activeBroadcasts.length === 0) return;

    let budgetLeft = remainingBudget;

    for (const broadcast of activeBroadcasts) {
      if (budgetLeft <= 0) break;

      const take = Math.min(BATCH_SIZE, budgetLeft);
      const recipients = await (jobPrisma as any).broadcastRecipient.findMany({
        where: {
          broadcastId: broadcast.id,
          status: { in: ['PENDING', 'FAILED_RETRY'] },
        },
        orderBy: { id: 'asc' },
        take,
      });

      if (recipients.length === 0) {
        await markCompletedIfDone(broadcast.id);
        continue;
      }

      console.log(
        `[BroadcastRunner] Broadcast ${broadcast.id}: sending ${recipients.length} (budget left ${budgetLeft})`
      );

      for (const r of recipients) {
        await sendToRecipient(r, broadcast);
        budgetLeft--;
        // Meta caps API at ~80 req/s; 100ms spacing = 10 req/s, comfortable.
        await sleep(100);
        if (budgetLeft <= 0) break;
      }

      await markCompletedIfDone(broadcast.id);
    }
  } catch (err) {
    console.error('[BroadcastRunner] Tick failed:', err);
  } finally {
    running = false;
  }
}

export function startBroadcastRunner() {
  console.log(
    `[BroadcastRunner] Started — every ${RUNNER_INTERVAL_MS / 1000}s, batch ${BATCH_SIZE}, daily cap ${DAILY_MARKETING_CAP}`
  );
  runOnce().catch((err) => console.error('[BroadcastRunner] Initial run failed:', err));
  setInterval(() => {
    runOnce().catch((err) => console.error('[BroadcastRunner] Tick failed:', err));
  }, RUNNER_INTERVAL_MS);
}

// Named export for immediate-kick invocation from admin-api.
export const broadcastRunner = { runOnce };
