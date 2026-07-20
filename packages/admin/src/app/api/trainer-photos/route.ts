import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const trainerId = req.nextUrl.searchParams.get('trainerId');
  if (!trainerId) {
    return NextResponse.json({ error: 'Missing trainerId' }, { status: 400 });
  }

  const photos = await prisma.trainerPhoto.findMany({
    where: { trainerId: Number(trainerId) },
    orderBy: { displayOrder: 'asc' },
  });

  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const { trainerId, imageUrl } = await req.json();

  if (!trainerId || !imageUrl) {
    return NextResponse.json({ error: 'Missing trainerId or imageUrl' }, { status: 400 });
  }

  const maxOrder = await prisma.trainerPhoto.aggregate({
    where: { trainerId },
    _max: { displayOrder: true },
  });

  const photo = await prisma.trainerPhoto.create({
    data: {
      trainerId,
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

  await prisma.trainerPhoto.delete({ where: { id: photoId } });
  return NextResponse.json({ success: true });
}
