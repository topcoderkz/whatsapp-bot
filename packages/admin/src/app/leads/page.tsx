import Link from 'next/link';
import clsx from 'clsx';
import { AdminLayout } from '@/components/admin-layout';
import { LocalTime } from '@/components/local-time';
import { prisma } from '@/lib/db';
import { stateLabel } from '@/lib/state-labels';

export const dynamic = 'force-dynamic';

type FilterKey = 'dropped' | 'active' | 'booked' | 'all';

const FILTER_LABELS: Record<FilterKey, string> = {
  dropped: 'Не дошли',
  active: 'Сейчас в диалоге',
  booked: 'Записались',
  all: 'Все',
};

const ACTIVE_WINDOW_MS = 60 * 60 * 1000; // 1h — matches BOOKING_TIMEOUT_HOURS in the bot

function statusOf(hasBooked: boolean, lastMessageAt: Date, now: number) {
  if (hasBooked) return 'booked' as const;
  if (now - lastMessageAt.getTime() < ACTIVE_WINDOW_MS) return 'active' as const;
  return 'dropped' as const;
}

const STATUS_BADGE: Record<'booked' | 'active' | 'dropped', { label: string; cls: string }> = {
  booked: { label: 'Записался', cls: 'bg-green-100 text-green-700' },
  active: { label: 'В диалоге', cls: 'bg-blue-100 text-blue-700' },
  dropped: { label: 'Не дошёл', cls: 'bg-yellow-100 text-yellow-700' },
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: filterParam } = await searchParams;
  const filter: FilterKey =
    filterParam === 'all' || filterParam === 'active' || filterParam === 'booked'
      ? filterParam
      : 'dropped';

  const leads = await prisma.lead.findMany({
    include: { branch: true },
    orderBy: { lastMessageAt: 'desc' },
    take: 500,
  });

  const now = Date.now();
  const annotated = leads.map((l) => ({
    ...l,
    status: statusOf(l.hasBooked, l.lastMessageAt, now),
  }));

  const counts = {
    dropped: annotated.filter((l) => l.status === 'dropped').length,
    active: annotated.filter((l) => l.status === 'active').length,
    booked: annotated.filter((l) => l.status === 'booked').length,
    all: annotated.length,
  };

  const visible = filter === 'all' ? annotated : annotated.filter((l) => l.status === filter);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Лиды</h1>
        <p className="text-sm text-gray-500 mt-1">
          Все, кто писал боту. «Не дошли» — клиенты, которые начали разговор, но не записались.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(['dropped', 'active', 'booked', 'all'] as FilterKey[]).map((key) => {
          const isActive = filter === key;
          return (
            <Link
              key={key}
              href={key === 'dropped' ? '/leads' : `/leads?filter=${key}`}
              className={clsx(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                isActive
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              {FILTER_LABELS[key]}
              <span className="text-xs text-gray-400">{counts[key]}</span>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Телефон</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Статус</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Последний экран</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Филиал</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Сообщений</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Первое сообщение</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Последнее сообщение</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((l) => {
              const badge = STATUS_BADGE[l.status];
              return (
                <tr key={l.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{l.phone}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', badge.cls)}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{stateLabel(l.lastState)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{l.branch?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{l.messageCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-500"><LocalTime iso={l.firstSeenAt.toISOString()} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500"><LocalTime iso={l.lastMessageAt.toISOString()} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="text-center py-8 text-sm text-gray-500">Пока никого нет.</p>
        )}
      </div>
    </AdminLayout>
  );
}
