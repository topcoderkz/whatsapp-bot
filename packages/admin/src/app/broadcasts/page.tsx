import { AdminLayout } from '@/components/admin-layout';
import { prisma } from '@/lib/db';
import { BroadcastsTable } from './broadcasts-table';

export const dynamic = 'force-dynamic';

export default async function BroadcastsPage() {
  const broadcasts = await prisma.broadcastMessage.findMany({
    include: { targetBranch: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Рассылки</h1>
        <a href="/broadcasts/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 text-center">
          + Новая рассылка
        </a>
      </div>

      <BroadcastsTable broadcasts={broadcasts} />
    </AdminLayout>
  );
}
