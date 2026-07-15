'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteClientsWithoutBranch } from '@/lib/actions';

export function DeleteBranchlessButton({ count }: { count: number }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [lastDeleted, setLastDeleted] = useState<number | null>(null);

  if (count === 0 && lastDeleted === null) return null;

  function handleDelete() {
    setConfirmOpen(false);
    startTransition(async () => {
      try {
        const res = await deleteClientsWithoutBranch();
        setLastDeleted(res.deleted);
        router.refresh();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-red-900">
            Клиентов без филиала: {count.toLocaleString('ru-RU')}
          </p>
          <p className="text-xs text-red-700 mt-0.5">
            Эти клиенты не попадают под фильтр «Клиенты филиала» и мешают рассылкам. Удалите, когда
            загрузите новые файлы по каждому филиалу.
          </p>
          {lastDeleted !== null && (
            <p className="text-xs text-green-700 mt-1">
              Удалено {lastDeleted.toLocaleString('ru-RU')} записей.
            </p>
          )}
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={isPending || count === 0}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
        >
          {isPending ? 'Удаляем...' : 'Удалить всех без филиала'}
        </button>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Удалить {count.toLocaleString('ru-RU')} клиентов без филиала?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Это действие нельзя отменить. Затрагиваются только записи, у которых не проставлен
              филиал. Клиенты, привязанные к какому-либо филиалу, останутся нетронутыми.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
