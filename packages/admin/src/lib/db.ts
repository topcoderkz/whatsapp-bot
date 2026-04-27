import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { adminPrisma: PrismaClient };

// Admin client — NO soft-delete extension, sees everything including inactive records
export const prisma = globalForPrisma.adminPrisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.adminPrisma = prisma;
}
