import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { landingPrisma: PrismaClient };

export const prisma = globalForPrisma.landingPrisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.landingPrisma = prisma;
}
