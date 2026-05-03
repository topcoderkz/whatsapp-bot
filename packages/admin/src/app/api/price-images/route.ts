import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { branchId, imageUrl } = body;

  if (!branchId) {
    return NextResponse.json({ error: 'Missing branchId' }, { status: 400 });
  }

  // Empty string or null means delete
  if (!imageUrl || imageUrl === '') {
    await prisma.priceImage.deleteMany({
      where: { branchId },
    });
    return NextResponse.json({ success: true, deleted: true });
  }

  // Upsert price image
  await prisma.priceImage.upsert({
    where: { branchId },
    update: { imageUrl },
    create: { branchId, imageUrl },
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const priceImages = await prisma.priceImage.findMany({
    include: { branch: true },
    orderBy: { branchId: 'asc' },
  });

  return NextResponse.json(priceImages);
}
