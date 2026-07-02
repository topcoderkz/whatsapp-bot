'use client';

import { useState, useTransition } from 'react';
import { updateBroadcast, sendBroadcast } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { LocalTime } from '@/components/local-time';
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

interface BroadcastData {
  id: number;
  title: string;
  messageText: string;
  templateName: string | null;
  templateVariables: string[] | null;
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

// Pick the best-fit template for an existing broadcast. If templateName isn't
// in the catalog anymore (renamed, removed) we fall back to the first entry so
// the form still opens; the admin can pick something valid before saving.
function initialTemplateId(broadcast: BroadcastData): string {
  const match = broadcast.templateName ? getBroadcastTemplate(broadcast.templateName) : null;
  return (match ?? BROADCAST_TEMPLATES[0]).id;
}

function initialValues(broadcast: BroadcastData, templateId: string): string[] {
  const template = getBroadcastTemplate(templateId)!;
  if (broadcast.templateVariables && broadcast.templateName === templateId) {
    return template.fields.map((_, i) => broadcast.templateVariables?.[i] ?? '');
  }
  // Legacy broadcast created before the template picker existed: dump the
  // whole message into the first variable so the admin sees their old text.
  return template.fields.map((_, i) => (i === 0 ? broadcast.messageText || '' : ''));
}

export function BroadcastEditForm({ broadcast, branches }: { broadcast: BroadcastData; branches: Branch[] }) {
  const router = useRouter();
  const isDraft = broadcast.status === 'DRAFT';
  const [step, setStep] = useState<'edit' | 'confirm' | 'sending' | 'done'>('edit');
  const [result, setResult] = useState<any>(null);
  const [filter, setFilter] = useState(broadcast.targetFilter);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [templateId, setTemplateId] = useState(() => initialTemplateId(broadcast));
  const template = getBroadcastTemplate(templateId)!;
  const [values, setValues] = useState<string[]>(() => initialValues(broadcast, templateId));

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

  function handleSave(formData: FormData) {
    startTransition(async () => {
      try {
        await updateBroadcast(broadcast.id, formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        alert((err as Error).message);
      }
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
            <label className="block text-sm font-medium text-gray-500 mb-1">Отправленное сообщение</label>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{preview}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Шаблон</label>
            <p className="text-sm text-gray-900">{template.displayName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Аудитория</label>
              <p className="text-sm text-gray-900">
                {broadcast.targetFilter === 'ALL'
                  ? 'Все клиенты'
                  : broadcast.targetFilter === 'BRANCH'
                  ? broadcast.targetBranch?.name || 'Филиал'
                  : 'Подписчики'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Дата</label>
              <p className="text-sm text-gray-900">
                <LocalTime iso={(broadcast.sentAt ?? broadcast.createdAt) as unknown as string} />
              </p>
            </div>
          </div>

          {broadcast.sentCount + broadcast.failedCount > 0 && (
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

  if (step === 'confirm') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Подтвердите отправку</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600 mb-6">
            Рассылка &laquo;{broadcast.title}&raquo; будет отправлена всем выбранным клиентам через WhatsApp. Это действие нельзя отменить.
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

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Редактировать рассылку</h1>
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.DRAFT}`}>
          Черновик
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form action={handleSave} className="space-y-5">
          <input type="hidden" name="templateId" value={templateId} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
            <input
              name="title"
              required
              defaultValue={broadcast.title}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                <select
                  name="targetBranchId"
                  defaultValue={broadcast.targetBranchId || ''}
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

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
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
