import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { AdminLayout } from '@/components/admin-layout';
import { BroadcastEditForm } from './broadcast-edit-form';
import { previewBroadcastAudience } from '@/lib/actions';

export const dynamic = 'force-dynamic';

async function loadRecipientStats(broadcastId: number) {
  const grouped = await prisma.broadcastRecipient.groupBy({
    by: ['status'],
    where: { broadcastId },
    _count: { _all: true },
  });
  const counts: Record<string, number> = {};
  let total = 0;
  for (const g of grouped) {
    counts[g.status] = g._count._all;
    total += g._count._all;
  }
  return { total, counts };
}

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

  const stats = await loadRecipientStats(broadcastId);

  // Live audience count — how many recipients the current filter matches in
  // the clients table. Only meaningful for DRAFT (no snapshot yet).
  const audience =
    broadcast.status === 'DRAFT'
      ? await previewBroadcastAudience(
          broadcast.targetFilter as any,
          broadcast.targetBranchId,
        )
      : { count: stats.total };

  return (
    <AdminLayout>
      <BroadcastEditForm
        broadcast={JSON.parse(JSON.stringify(broadcast))}
        branches={branches}
        stats={stats}
        audienceCount={audience.count}
      />
    </AdminLayout>
  );
}
