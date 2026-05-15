import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const branchId = req.nextUrl.searchParams.get('branchId');
  if (!branchId) {
    return NextResponse.json({ error: 'Missing branchId' }, { status: 400 });
  }

  const photos = await prisma.branchPhoto.findMany({
    where: { branchId: Number(branchId) },
    orderBy: { displayOrder: 'asc' },
  });

  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const { branchId, imageUrl } = await req.json();

  if (!branchId || !imageUrl) {
    return NextResponse.json({ error: 'Missing branchId or imageUrl' }, { status: 400 });
  }

  const maxOrder = await prisma.branchPhoto.aggregate({
    where: { branchId },
    _max: { displayOrder: true },
  });

  const photo = await prisma.branchPhoto.create({
    data: {
      branchId,
      imageUrl,
      displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(photo);
}

export async function DELETE(req: NextRequest) {
  const { photoId } = await req.json();

  if (!photoId) {
    return NextResponse.json({ error: 'Missing photoId' }, { status: 400 });
  }

  await prisma.branchPhoto.delete({ where: { id: photoId } });
  return NextResponse.json({ success: true });
}
