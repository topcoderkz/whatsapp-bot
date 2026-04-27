import { PrismaClient } from '@prisma/client';

const jobPrisma = new PrismaClient();

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // every hour

export function startPromotionExpiry() {
  console.log('[PromotionExpiry] Started — running every hour');

  setInterval(async () => {
    try {
      const now = new Date();

      const result = await jobPrisma.promotion.updateMany({
        where: {
          isActive: true,
          endDate: { lt: now },
        },
        data: {
          isActive: false,
        },
      });

      if (result.count > 0) {
        console.log(`[PromotionExpiry] Deactivated ${result.count} expired promotions`);
      }
    } catch (err) {
      console.error('[PromotionExpiry] Error:', err);
    }
  }, CHECK_INTERVAL_MS);
}
