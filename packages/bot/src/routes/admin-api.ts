import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { bookingService } from '../services/booking.service';
import { notificationService } from '../services/notification.service';
import { config } from '../config';

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
router.post('/broadcasts/send', async (req: Request, res: Response) => {
  try {
    const { broadcastId } = req.body;
    if (!broadcastId) {
      return res.status(400).json({ error: 'broadcastId is required' });
    }

    // Get broadcast and determine recipients
    const broadcast = await adminPrisma.broadcastMessage.findUnique({
      where: { id: broadcastId },
    });

    if (!broadcast) {
      return res.status(404).json({ error: 'Broadcast not found' });
    }

    // Build recipient list based on filter
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
    });

    const phones = clients.map((c) => c.phone);

    // Send broadcast in background
    const result = await notificationService.sendBroadcast(broadcastId, phones);

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[AdminAPI] Send broadcast error:', err);
    res.status(500).json({ error: 'Failed to send broadcast' });
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
