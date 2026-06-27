import { PrismaClient } from '@prisma/client';
import { notificationService } from '../services/notification.service';

// Plain client (no soft-delete extension) — same pattern as booking-cleanup.ts
const jobPrisma = new PrismaClient();

const SILENCE_THRESHOLD_MS = 5 * 60 * 1000;
const FOLLOWUP_INTERVAL_MS = 5 * 60 * 1000;

export async function runOnce(): Promise<void> {
  const cutoff = new Date(Date.now() - SILENCE_THRESHOLD_MS);

  const candidates = await (jobPrisma as any).lead.findMany({
    where: {
      hasBooked: false,
      branchId: { not: null },
      lastMessageAt: { lt: cutoff },
      managerNotifiedAt: null,
    },
    include: { branch: true },
  });

  if (candidates.length === 0) return;

  console.log(`[LeadFollowup] Notifying managers about ${candidates.length} dropped lead(s)`);

  for (const lead of candidates) {
    if (!lead.branch || !lead.branch.managerPhone) continue;
    try {
      await notificationService.notifyManagerNewLead(lead, lead.branch);
      await (jobPrisma as any).lead.update({
        where: { id: lead.id },
        data: { managerNotifiedAt: new Date() },
      });
    } catch (err) {
      // Leave manager_notified_at NULL so the next tick retries.
      console.error(`[LeadFollowup] Failed to notify for lead ${lead.id}:`, (err as Error).message);
    }
  }
}

export function startLeadFollowup() {
  console.log(`[LeadFollowup] Started — running every ${FOLLOWUP_INTERVAL_MS / 60000} min, silence threshold ${SILENCE_THRESHOLD_MS / 60000} min`);
  runOnce().catch((err) => console.error('[LeadFollowup] Initial run failed:', err));
  setInterval(() => {
    runOnce().catch((err) => console.error('[LeadFollowup] Tick failed:', err));
  }, FOLLOWUP_INTERVAL_MS);
}
