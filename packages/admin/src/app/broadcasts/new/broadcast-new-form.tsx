'use client';

import { useState, useTransition } from 'react';
import { createBroadcast, sendBroadcast } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { sanitizeBroadcastParam } from '@/lib/broadcast-sanitize';
import {
  BROADCAST_TEMPLATES,
  getBroadcastTemplate,
  renderBroadcastPreview,
} from '@/lib/broadcast-templates';

interface Branch {
  id: number;
  name: string;
}

export function BroadcastNewForm({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<'compose' | 'confirm' | 'sending' | 'done'>('compose');
  const [broadcastId, setBroadcastId] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [filter, setFilter] = useState('ALL');
  const [templateId, setTemplateId] = useState(BROADCAST_TEMPLATES[0].id);
  const template = getBroadcastTemplate(templateId)!;
  // One value per field; reset when template changes.
  const [values, setValues] = useState<string[]>(template.fields.map(() => ''));

  function handleTemplateChange(id: string) {
    const next = getBroadcastTemplate(id);
    if (!next) return;
    setTemplateId(id);
    setValues(next.fields.map(() => ''));
  }

  function updateValue(index: number, value: string) {
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  const sanitizedValues = values.map(sanitizeBroadcastParam);
  const preview = renderBroadcastPreview(template, sanitizedValues);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const id = await createBroadcast(formData);
        setBroadcastId(id);
        setStep('confirm');
      } catch (err) {
        alert((err as Error).message);
      }
    });
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
          <form action={handleSubmit} className="space-y-5">
            <input type="hidden" name="templateId" value={templateId} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Заголовок (для вашего удобства)
              </label>
              <input
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Летние скидки"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Шаблон</label>
              <select
                value={templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {BROADCAST_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.displayName}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-500">{template.description}</p>
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-4">
              {template.fields.map((field, i) => (
                <div key={field.variableIndex}>
                  <div className="flex items-baseline justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                    <span className="text-xs text-gray-400">
                      {values[i].length} / {field.maxLength}
                    </span>
                  </div>
                  {field.multiline ? (
                    <textarea
                      name={`var_${field.variableIndex}`}
                      required
                      rows={3}
                      value={values[i]}
                      onChange={(e) => updateValue(i, e.target.value)}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  ) : (
                    <input
                      name={`var_${field.variableIndex}`}
                      required
                      value={values[i]}
                      onChange={(e) => updateValue(i, e.target.value)}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Превью — как получит клиент
              </label>
              <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-3 text-sm text-gray-800 whitespace-pre-wrap break-words min-h-[8rem]">
                {preview}
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Формат текста фиксирован — WhatsApp одобряет шаблон целиком. Вы меняете только выделенные поля.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
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
                  <select
                    name="targetBranchId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Выберите филиал</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Создание...' : 'Далее'}
            </button>
          </form>
        </div>
      )}

      {step === 'confirm' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Подтвердите отправку</h2>
          <p className="text-sm text-gray-600 mb-6">
            Рассылка будет отправлена всем выбранным клиентам через WhatsApp. Это действие нельзя отменить.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSend}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Отправить
            </button>
            <button
              onClick={() => router.push('/broadcasts')}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
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
          <button
            onClick={() => router.push('/broadcasts')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            К рассылкам
          </button>
        </div>
      )}
    </>
  );
}
