import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { AdminLayout } from '@/components/admin-layout';
import { BroadcastEditForm } from './broadcast-edit-form';
import { previewBroadcastAudience } from '@/lib/actions';

export const dynamic = 'force-dynamic';

// Show at most this many recipient rows on the detail page. For a huge
// campaign (5,738 recipients on Кожамкулова, 13k on "все"), rendering
// every row would nuke the page. We surface aggregate stats at the top
// anyway; this list is for spot-checking.
const RECIPIENT_ROWS_LIMIT = 500;

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

async function loadRecipients(broadcastId: number) {
  const rows = await prisma.broadcastRecipient.findMany({
    where: { broadcastId },
    orderBy: [{ status: 'asc' }, { id: 'asc' }],
    take: RECIPIENT_ROWS_LIMIT,
  });
  if (rows.length === 0) return [];

  // Join client names by phone (there's no FK on broadcast_recipients → clients
  // because the snapshot is deterministic even if a client is later deleted).
  const clients = await prisma.client.findMany({
    where: { phone: { in: rows.map((r) => r.phone) } },
    select: { phone: true, name: true },
  });
  const nameByPhone = new Map(clients.map((c) => [c.phone, c.name] as const));

  return rows.map((r) => ({
    id: r.id,
    phone: r.phone,
    name: nameByPhone.get(r.phone) ?? null,
    status: r.status,
    sentAt: r.sentAt,
    deliveredAt: r.deliveredAt,
    readAt: r.readAt,
    errorMessage: r.errorMessage,
  }));
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
  const recipients = await loadRecipients(broadcastId);
  const truncated = stats.total > RECIPIENT_ROWS_LIMIT;

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
        recipients={JSON.parse(JSON.stringify(recipients))}
        truncated={truncated}
        limit={RECIPIENT_ROWS_LIMIT}
      />
    </AdminLayout>
  );
}
