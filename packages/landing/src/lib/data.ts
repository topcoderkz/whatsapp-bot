import { unstable_cache } from 'next/cache';
import { prisma } from './db';

export const getBranches = unstable_cache(
  async () => {
    try {
      return await prisma.branch.findMany({
        where: { isActive: true },
        include: {
          photos: { orderBy: { displayOrder: 'asc' } },
        },
        orderBy: { id: 'asc' },
      });
    } catch {
      // Fallback if branch_photos table doesn't exist yet (migration pending)
      const branches = await prisma.branch.findMany({
        where: { isActive: true },
        orderBy: { id: 'asc' },
      });
      return branches.map((b) => ({ ...b, photos: [] }));
    }
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
      include: { branches: { select: { id: true, slug: true, name: true } } },
      orderBy: { startDate: 'desc' },
    });
  },
  ['active-promotions'],
  { revalidate: 300 }
);

// Promos that apply to a specific branch: either explicitly targeting it,
// or with an empty branch set (the "all branches" convention).
export async function getActivePromotionsForBranch(branchId: number) {
  try {
    const now = new Date();
    return await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { branches: { none: {} } },
          { branches: { some: { id: branchId } } },
        ],
      },
      include: { branches: { select: { id: true, slug: true, name: true } } },
      orderBy: { startDate: 'desc' },
    });
  } catch {
    return [];
  }
}

export const getActiveBranchSlugs = unstable_cache(
  async () => {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    return branches.map((b) => b.slug);
  },
  ['branch-slugs'],
  { revalidate: 300 }
);

export async function getTrainerById(id: number) {
  try {
    return await prisma.trainer.findFirst({
      where: { id, isActive: true },
      include: {
        branch: { select: { id: true, name: true, slug: true } },
        groupClasses: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getBranchBySlug(slug: string) {
  try {
    return await prisma.branch.findFirst({
      where: { slug, isActive: true },
      include: {
        photos: { orderBy: { displayOrder: 'asc' } },
        memberships: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        trainers: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        groupClasses: {
          where: { isActive: true },
          include: { trainer: { select: { name: true } } },
          orderBy: { name: 'asc' },
        },
      },
    });
  } catch {
    // Fallback if any related table is missing (defensive — matches getBranches pattern)
    return prisma.branch.findFirst({
      where: { slug, isActive: true },
    });
  }
}
