import { PrismaClient } from '@prisma/client';

// Use a plain PrismaClient (no soft-delete extension) for cleanup jobs
const jobPrisma = new PrismaClient();

const BOOKING_TIMEOUT_HOURS = 1;
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // every 15 minutes

export function startBookingCleanup() {
  console.log('[BookingCleanup] Started — running every 15 minutes');

  setInterval(async () => {
    try {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - BOOKING_TIMEOUT_HOURS);

      const result = await jobPrisma.booking.updateMany({
        where: {
          status: 'PENDING',
          createdAt: { lt: cutoff },
        },
        data: {
          status: 'CANCELLED',
        },
      });

      if (result.count > 0) {
        console.log(`[BookingCleanup] Cancelled ${result.count} expired pending bookings`);
      }
    } catch (err) {
      console.error('[BookingCleanup] Error:', err);
    }
  }, CLEANUP_INTERVAL_MS);
}
