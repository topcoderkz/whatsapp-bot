import { AdminLayout } from '@/components/admin-layout';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BroadcastsPage() {
  const broadcasts = await prisma.broadcastMessage.findMany({
    include: { targetBranch: true },
    orderBy: { createdAt: 'desc' },
  });

  const statusLabels: Record<string, string> = {
    DRAFT: 'Черновик',
    SENDING: 'Отправляется',
    SENT: 'Отправлено',
    FAILED: 'Ошибка',
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    SENDING: 'bg-blue-100 text-blue-700',
    SENT: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Рассылки</h1>
        <Link href="/broadcasts/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          + Новая рассылка
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Заголовок</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Аудитория</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Статус</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Отправлено</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Дата</th>
            </tr>
          </thead>
          <tbody>
            {broadcasts.map((b) => (
              <tr key={b.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-sm font-medium">
                  <Link href={`/broadcasts/${b.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                    {b.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {b.targetFilter === 'ALL' ? 'Все клиенты' : b.targetFilter === 'BRANCH' ? b.targetBranch?.name || 'Филиал' : 'Подписчики'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status]}`}>
                    {statusLabels[b.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {b.sentCount > 0 ? `${b.sentCount} / ${b.sentCount + b.failedCount}` : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {b.sentAt ? new Date(b.sentAt).toLocaleDateString('ru-RU') : new Date(b.createdAt).toLocaleDateString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {broadcasts.length === 0 && (
          <p className="text-center py-8 text-sm text-gray-500">Рассылок пока нет.</p>
        )}
      </div>
    </AdminLayout>
  );
}
