import { unstable_cache } from 'next/cache';
import { prisma } from './db';

export const getBranches = unstable_cache(
  async () => {
    return prisma.branch.findMany({
      where: { isActive: true },
      include: {
        photos: { orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { id: 'asc' },
    });
  },
  ['branches'],
  { revalidate: 300 }
);

export const getMemberships = unstable_cache(
  async () => {
    return prisma.membership.findMany({
      where: { isActive: true },
      include: { branch: { select: { id: true, name: true } } },
      orderBy: [{ branchId: 'asc' }, { displayOrder: 'asc' }],
    });
  },
  ['memberships'],
  { revalidate: 300 }
);

export const getTrainers = unstable_cache(
  async () => {
    return prisma.trainer.findMany({
      where: { isActive: true },
      include: { branch: { select: { id: true, name: true } } },
      orderBy: [{ branchId: 'asc' }, { name: 'asc' }],
    });
  },
  ['trainers'],
  { revalidate: 300 }
);

export const getGroupClasses = unstable_cache(
  async () => {
    return prisma.groupClass.findMany({
      where: { isActive: true },
      include: {
        branch: { select: { id: true, name: true } },
        trainer: { select: { name: true } },
      },
      orderBy: [{ branchId: 'asc' }, { name: 'asc' }],
    });
  },
  ['group-classes'],
  { revalidate: 300 }
);

export const getActivePromotions = unstable_cache(
  async () => {
    const now = new Date();
    return prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: 'desc' },
    });
  },
  ['active-promotions'],
  { revalidate: 300 }
);
