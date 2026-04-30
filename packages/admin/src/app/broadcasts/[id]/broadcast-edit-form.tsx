'use client';

import { useState, useTransition } from 'react';
import { updateBroadcast, sendBroadcast } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface Branch {
  id: number;
  name: string;
}

interface BroadcastData {
  id: number;
  title: string;
  messageText: string;
  templateName: string | null;
  targetFilter: string;
  targetBranchId: number | null;
  status: string;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  sentAt: string | null;
  targetBranch: { id: number; name: string } | null;
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

export function BroadcastEditForm({ broadcast, branches }: { broadcast: BroadcastData; branches: Branch[] }) {
  const router = useRouter();
  const isDraft = broadcast.status === 'DRAFT';
  const [step, setStep] = useState<'edit' | 'confirm' | 'sending' | 'done'>('edit');
  const [result, setResult] = useState<any>(null);
  const [filter, setFilter] = useState(broadcast.targetFilter);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await updateBroadcast(broadcast.id, formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  async function handleSend() {
    setStep('sending');
    const res = await sendBroadcast(broadcast.id);
    setResult(res);
    setStep('done');
  }

  // Read-only view for non-DRAFT broadcasts
  if (!isDraft) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{broadcast.title}</h1>
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[broadcast.status]}`}>
            {statusLabels[broadcast.status]}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Текст сообщения</label>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{broadcast.messageText}</p>
          </div>

          {broadcast.templateName && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Шаблон WhatsApp</label>
              <p className="text-sm text-gray-900">{broadcast.templateName}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Аудитория</label>
              <p className="text-sm text-gray-900">
                {broadcast.targetFilter === 'ALL' ? 'Все клиенты' : broadcast.targetFilter === 'BRANCH' ? broadcast.targetBranch?.name || 'Филиал' : 'Подписчики'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Дата</label>
              <p className="text-sm text-gray-900">
                {broadcast.sentAt ? new Date(broadcast.sentAt).toLocaleString('ru-RU') : new Date(broadcast.createdAt).toLocaleString('ru-RU')}
              </p>
            </div>
          </div>

          {broadcast.sentCount > 0 && (
            <div className="flex gap-8 pt-2">
              <div>
                <p className="text-2xl font-bold text-green-600">{broadcast.sentCount}</p>
                <p className="text-xs text-gray-500">Отправлено</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{broadcast.failedCount}</p>
                <p className="text-xs text-gray-500">Ошибок</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/broadcasts')}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
        >
          Назад к рассылкам
        </button>
      </div>
    );
  }

  // Send confirmation
  if (step === 'confirm') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Подтвердите отправку</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600 mb-6">
            Рассылка &laquo;{broadcast.title}&raquo; будет отправлена всем выбранным клиентам через WhatsApp.
            Это действие нельзя отменить.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleSend} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Отправить
            </button>
            <button onClick={() => setStep('edit')} className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
              Отмена
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'sending') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{broadcast.title}</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-lg font-semibold text-gray-900">Отправляем рассылку...</p>
          <p className="text-sm text-gray-500 mt-2">Пожалуйста, подождите.</p>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{broadcast.title}</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {result?.error ? 'Ошибка' : 'Рассылка отправлена!'}
          </h2>
          {result?.error ? (
            <p className="text-sm text-red-600 mb-4">{result.error}</p>
          ) : (
            <div className="flex justify-center gap-8 mb-6">
              <div>
                <p className="text-3xl font-bold text-green-600">{result?.sent || 0}</p>
                <p className="text-xs text-gray-500">Отправлено</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{result?.failed || 0}</p>
                <p className="text-xs text-gray-500">Ошибок</p>
              </div>
            </div>
          )}
          <button onClick={() => router.push('/broadcasts')} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            К рассылкам
          </button>
        </div>
      </div>
    );
  }

  // Editable draft form
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Редактировать рассылку</h1>
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.DRAFT}`}>
          Черновик
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form action={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
            <input name="title" required defaultValue={broadcast.title} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Текст сообщения</label>
            <textarea name="messageText" required rows={4} defaultValue={broadcast.messageText} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название шаблона WhatsApp (необязательно)</label>
            <input name="templateName" defaultValue={broadcast.templateName || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="broadcast_message" />
            <p className="text-xs text-gray-400 mt-1">Если не указан, используется шаблон по умолчанию</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Аудитория</label>
              <select
                name="targetFilter"
                defaultValue={broadcast.targetFilter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="ALL">Все клиенты</option>
                <option value="SUBSCRIBED">Только подписчики</option>
                <option value="BRANCH">Клиенты филиала</option>
              </select>
            </div>
            {filter === 'BRANCH' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Филиал</label>
                <select name="targetBranchId" defaultValue={broadcast.targetBranchId || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Выберите филиал</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setStep('confirm')}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Отправить
            </button>
            <button
              type="button"
              onClick={() => router.push('/broadcasts')}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              Отмена
            </button>
            {saved && <span className="text-sm text-green-600">Сохранено</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
