'use client';

import { useState, useTransition } from 'react';
import { deleteBroadcast } from '@/lib/actions';
import Link from 'next/link';

interface Broadcast {
  id: number;
  title: string;
  targetFilter: string;
  targetBranch: { name: string } | null;
  status: string;
  sentCount: number;
  failedCount: number;
  sentAt: Date | null;
  createdAt: Date;
}

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

export function BroadcastsTable({ broadcasts }: { broadcasts: Broadcast[] }) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteBroadcast(id);
        setDeletingId(id);
        setTimeout(() => setDeletingId(null), 500);
      } catch (err) {
        alert((err as Error).message);
      }
    });
    setShowConfirm(null);
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Заголовок</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Аудитория</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Статус</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Отправлено</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Дата</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            {broadcasts.map((b) => (
              <tr
                key={b.id}
                className={`border-b border-gray-100 last:border-0 transition-opacity ${deletingId === b.id ? 'opacity-50' : ''}`}
              >
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
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setShowConfirm(b.id)}
                    disabled={isPending}
                    className="text-xs text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {broadcasts.length === 0 && (
          <p className="text-center py-8 text-sm text-gray-500">Рассылок пока нет.</p>
        )}
      </div>

      {/* Confirmation modal */}
      {showConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Удалить рассылку?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Это действие нельзя отменить. Рассылка будет удалена безвозвратно.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(showConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
