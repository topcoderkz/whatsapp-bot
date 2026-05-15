import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  const { photoIds } = await req.json();

  if (!Array.isArray(photoIds) || photoIds.length === 0) {
    return NextResponse.json({ error: 'Missing photoIds array' }, { status: 400 });
  }

  await prisma.$transaction(
    photoIds.map((id: number, index: number) =>
      prisma.branchPhoto.update({
        where: { id },
        data: { displayOrder: index },
      })
    )
  );

  return NextResponse.json({ success: true });
}
