import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { bookingService } from '../services/booking.service';
import { broadcastRunner } from '../jobs/broadcast-runner';

const router: ReturnType<typeof Router> = Router();

// Admin Prisma client — no soft-delete extension, sees everything
const adminPrisma = new PrismaClient();

// Simple auth middleware for admin API
function adminAuth(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // In production, verify JWT. For now, check against the admin secret.
    const token = authHeader.split(' ')[1];
    // The admin panel will send the JWT token that it generated on login
    // For simplicity, we validate by checking the token isn't empty
    if (!token) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.use(adminAuth);

// POST /admin/bookings/:id/confirm
router.post('/bookings/:id/confirm', async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id as string, 10);
    const booking = await bookingService.confirmBooking(bookingId);
    res.json({ success: true, booking });
  } catch (err) {
    console.error('[AdminAPI] Confirm booking error:', err);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

// POST /admin/bookings/:id/cancel
router.post('/bookings/:id/cancel', async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id as string, 10);
    const booking = await bookingService.cancelBooking(bookingId);
    res.json({ success: true, booking });
  } catch (err) {
    console.error('[AdminAPI] Cancel booking error:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// POST /admin/broadcasts/send
// Snapshots recipients into broadcast_recipients (one row each, status=PENDING)
// and flips the broadcast to SENDING. The batch runner cron picks it up from
// there — we don't send inline anymore, so a 13k-recipient campaign doesn't
// block this HTTP call for 15 seconds.
//
// Body: { broadcastId: number, scope?: 'test' | 'all' }
//   scope='test' snapshots only the first 20 matching clients (used for the
//   "Отправить пробную" button so admin can smoke-test before committing to
//   the full base).
router.post('/broadcasts/send', async (req: Request, res: Response) => {
  try {
    const { broadcastId, scope } = req.body as { broadcastId?: number; scope?: 'test' | 'all' };
    if (!broadcastId) {
      return res.status(400).json({ error: 'broadcastId is required' });
    }
    const scopeToUse: 'test' | 'all' = scope === 'test' ? 'test' : 'all';

    const broadcast = await adminPrisma.broadcastMessage.findUnique({
      where: { id: broadcastId },
    });
    if (!broadcast) {
      return res.status(404).json({ error: 'Broadcast not found' });
    }
    if (broadcast.status !== 'DRAFT') {
      return res.status(409).json({ error: 'Broadcast already started', status: broadcast.status });
    }

    const clientWhere: any = { isActive: true };
    if (broadcast.targetFilter === 'SUBSCRIBED') {
      clientWhere.isSubscribed = true;
    }
    if (broadcast.targetFilter === 'BRANCH' && broadcast.targetBranchId) {
      clientWhere.branchId = broadcast.targetBranchId;
    }

    const clients = await adminPrisma.client.findMany({
      where: clientWhere,
      select: { phone: true },
      orderBy: { id: 'asc' },
      ...(scopeToUse === 'test' ? { take: 20 } : {}),
    });

    if (clients.length === 0) {
      return res.status(400).json({ error: 'Нет получателей под этот фильтр' });
    }

    // Snapshot into broadcast_recipients. createMany + skipDuplicates handles
    // the (broadcast_id, phone) unique constraint if the same phone appears
    // twice in clients or if the admin somehow triggers Send twice.
    await adminPrisma.broadcastRecipient.createMany({
      data: clients.map((c) => ({ broadcastId, phone: c.phone })),
      skipDuplicates: true,
    });

    await adminPrisma.broadcastMessage.update({
      where: { id: broadcastId },
      data: { status: 'SENDING' },
    });

    // Kick off the first batch immediately instead of waiting for the next
    // cron tick — the admin sees progress within seconds. Runs async; we
    // return 200 to the admin right away.
    broadcastRunner.runOnce().catch((err) => {
      console.error('[AdminAPI] Immediate batch failed:', err);
    });

    res.json({ success: true, snapshotted: clients.length, scope: scopeToUse });
  } catch (err) {
    console.error('[AdminAPI] Send broadcast error:', err);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

// POST /admin/broadcasts/:id/retry
// Marks all FAILED_RETRY recipients of a broadcast back to PENDING so the
// runner picks them up on the next tick. FAILED_PERMANENT stays untouched.
router.post('/broadcasts/:id/retry', async (req: Request, res: Response) => {
  try {
    const broadcastId = parseInt(req.params.id as string, 10);
    const result = await adminPrisma.broadcastRecipient.updateMany({
      where: { broadcastId, status: 'FAILED_RETRY' },
      data: { status: 'PENDING' },
    });
    // Re-open the broadcast if it was COMPLETED (or SENDING).
    await adminPrisma.broadcastMessage.update({
      where: { id: broadcastId },
      data: { status: 'SENDING' },
    });
    broadcastRunner.runOnce().catch((err) => console.error('[AdminAPI] Retry batch failed:', err));
    res.json({ success: true, retried: result.count });
  } catch (err) {
    console.error('[AdminAPI] Retry broadcast error:', err);
    res.status(500).json({ error: 'Failed to retry broadcast' });
  }
});

// POST /admin/broadcasts/:id/cancel
// Marks remaining PENDING/FAILED_RETRY recipients as SKIPPED and closes the
// campaign. Anything already SENT/DELIVERED/READ stays as-is.
router.post('/broadcasts/:id/cancel', async (req: Request, res: Response) => {
  try {
    const broadcastId = parseInt(req.params.id as string, 10);
    const result = await adminPrisma.broadcastRecipient.updateMany({
      where: { broadcastId, status: { in: ['PENDING', 'FAILED_RETRY'] } },
      data: { status: 'SKIPPED' },
    });
    await adminPrisma.broadcastMessage.update({
      where: { id: broadcastId },
      data: { status: 'SENT' },
    });
    res.json({ success: true, skipped: result.count });
  } catch (err) {
    console.error('[AdminAPI] Cancel broadcast error:', err);
    res.status(500).json({ error: 'Failed to cancel broadcast' });
  }
});

// GET /admin/broadcasts/:id/stats — aggregate progress for the admin UI.
router.get('/broadcasts/:id/stats', async (req: Request, res: Response) => {
  try {
    const broadcastId = parseInt(req.params.id as string, 10);
    const grouped = await adminPrisma.broadcastRecipient.groupBy({
      by: ['status'],
      where: { broadcastId },
      _count: { _all: true },
    });
    const counts: Record<string, number> = {};
    let total = 0;
    for (const g of grouped) {
      counts[g.status] = g._count._all;
      total += g._count._all;
    }
    res.json({ total, counts });
  } catch (err) {
    console.error('[AdminAPI] Stats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

// GET /admin/stats — dashboard stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalClients,
      activeClients,
      todayBookings,
      pendingBookings,
      activePromos,
    ] = await Promise.all([
      adminPrisma.client.count(),
      adminPrisma.client.count({ where: { isActive: true } }),
      adminPrisma.booking.count({ where: { createdAt: { gte: today } } }),
      adminPrisma.booking.count({ where: { status: 'PENDING' } }),
      adminPrisma.promotion.count({ where: { isActive: true } }),
    ]);

    res.json({
      totalClients,
      activeClients,
      todayBookings,
      pendingBookings,
      activePromos,
    });
  } catch (err) {
    console.error('[AdminAPI] Stats error:', err);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export { router as adminApiRouter };
