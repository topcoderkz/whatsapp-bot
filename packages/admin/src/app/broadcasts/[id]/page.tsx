import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { AdminLayout } from '@/components/admin-layout';
import { BroadcastEditForm } from './broadcast-edit-form';

export const dynamic = 'force-dynamic';

export default async function BroadcastDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const broadcastId = parseInt(id, 10);
  if (isNaN(broadcastId)) notFound();

  const broadcast = await prisma.broadcastMessage.findUnique({
    where: { id: broadcastId },
    include: { targetBranch: true },
  });
  if (!broadcast) notFound();

  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return (
    <AdminLayout>
      <BroadcastEditForm
        broadcast={JSON.parse(JSON.stringify(broadcast))}
        branches={branches}
      />
    </AdminLayout>
  );
}
