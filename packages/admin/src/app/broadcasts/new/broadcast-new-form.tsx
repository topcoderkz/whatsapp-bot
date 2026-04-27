'use client';

import { useState } from 'react';
import { createBroadcast, sendBroadcast } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface Branch {
  id: number;
  name: string;
}

export function BroadcastNewForm({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const [step, setStep] = useState<'compose' | 'confirm' | 'sending' | 'done'>('compose');
  const [broadcastId, setBroadcastId] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [filter, setFilter] = useState('ALL');

  async function handleCreate(formData: FormData) {
    const id = await createBroadcast(formData);
    setBroadcastId(id);
    setStep('confirm');
  }

  async function handleSend() {
    if (!broadcastId) return;
    setStep('sending');
    const res = await sendBroadcast(broadcastId);
    setResult(res);
    setStep('done');
  }

  return (
    <>
      {step === 'compose' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form action={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок (для вашего удобства)</label>
              <input name="title" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Летние скидки" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Текст сообщения</label>
              <textarea name="messageText" required rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Текст рассылки..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название шаблона WhatsApp (необязательно)</label>
              <input name="templateName" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="broadcast_message" />
              <p className="text-xs text-gray-400 mt-1">Если не указан, используется шаблон по умолчанию</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Аудитория</label>
                <select
                  name="targetFilter"
                  value={filter}
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
                  <select name="targetBranchId" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Выберите филиал</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Далее
            </button>
          </form>
        </div>
      )}

      {step === 'confirm' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Подтвердите отправку</h2>
          <p className="text-sm text-gray-600 mb-6">
            Рассылка будет отправлена всем выбранным клиентам через WhatsApp.
            Это действие нельзя отменить.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleSend} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Отправить
            </button>
            <button onClick={() => router.push('/broadcasts')} className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
              Отмена
            </button>
          </div>
        </div>
      )}

      {step === 'sending' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-lg font-semibold text-gray-900">Отправляем рассылку...</p>
          <p className="text-sm text-gray-500 mt-2">Пожалуйста, подождите.</p>
        </div>
      )}

      {step === 'done' && (
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
      )}
    </>
  );
}
