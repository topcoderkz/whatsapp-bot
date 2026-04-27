import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Bot client: auto-filters is_active=true on soft-deletable models
function createBotPrismaClient() {
  const base = new PrismaClient();

  return base.$extends({
    query: {
      branch: {
        async findMany({ args, query }) {
          args.where = { ...args.where, isActive: true };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, isActive: true };
          return query(args);
        },
      },
      membership: {
        async findMany({ args, query }) {
          args.where = { ...args.where, isActive: true };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, isActive: true };
          return query(args);
        },
      },
      trainer: {
        async findMany({ args, query }) {
          args.where = { ...args.where, isActive: true };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, isActive: true };
          return query(args);
        },
      },
      groupClass: {
        async findMany({ args, query }) {
          args.where = { ...args.where, isActive: true };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, isActive: true };
          return query(args);
        },
      },
      promotion: {
        async findMany({ args, query }) {
          args.where = { ...args.where, isActive: true };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, isActive: true };
          return query(args);
        },
      },
    },
  });
}

export type BotPrismaClient = ReturnType<typeof createBotPrismaClient>;

export const prisma = globalForPrisma.prisma || createBotPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma as unknown as PrismaClient;
}
