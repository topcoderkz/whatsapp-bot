import { AdminLayout } from '@/components/admin-layout';
import { prisma } from '@/lib/db';
import { BroadcastsTable } from './broadcasts-table';

export const dynamic = 'force-dynamic';

export default async function BroadcastsPage() {
  const broadcasts = await prisma.broadcastMessage.findMany({
    include: { targetBranch: true },
    orderBy: { createdAt: 'desc' },
  });

  // Aggregate per-broadcast recipient counts so the list shows real campaign
  // progress instead of the stale sent_count column (which only updates when
  // a campaign closes).
  const ids = broadcasts.map((b) => b.id);
  const grouped = ids.length
    ? await prisma.broadcastRecipient.groupBy({
        by: ['broadcastId', 'status'],
        where: { broadcastId: { in: ids } },
        _count: { _all: true },
      })
    : [];

  const statsByBroadcast: Record<number, Record<string, number>> = {};
  for (const g of grouped) {
    statsByBroadcast[g.broadcastId] ||= {};
    statsByBroadcast[g.broadcastId][g.status] = g._count._all;
  }

  const enriched = broadcasts.map((b) => ({
    ...b,
    stats: statsByBroadcast[b.id] || {},
  }));

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Рассылки</h1>
        <a
          href="/broadcasts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 text-center"
        >
          + Новая рассылка
        </a>
      </div>

      <BroadcastsTable broadcasts={JSON.parse(JSON.stringify(enriched))} />
    </AdminLayout>
  );
}
