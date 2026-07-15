'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  updateBroadcast,
  startTestBatch,
  startFullCampaign,
  retryFailedRecipients,
  cancelBroadcast,
} from '@/lib/actions';
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

interface Stats {
  total: number;
  counts: Record<string, number>;
}

interface Recipient {
  id: number;
  phone: string;
  name: string | null;
  status: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  errorMessage: string | null;
}

const recipientStatusLabels: Record<string, string> = {
  PENDING: 'В очереди',
  SENT: 'Отправлено',
  DELIVERED: 'Доставлено',
  READ: 'Прочитано',
  FAILED_RETRY: 'Повтор',
  FAILED_PERMANENT: 'Отклонено',
  SKIPPED: 'Пропущено',
};

const recipientStatusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  SENT: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-cyan-100 text-cyan-700',
  READ: 'bg-green-100 text-green-700',
  FAILED_RETRY: 'bg-yellow-100 text-yellow-700',
  FAILED_PERMANENT: 'bg-red-100 text-red-700',
  SKIPPED: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Черновик',
  SENDING: 'В процессе',
  SENT: 'Завершено',
  FAILED: 'Ошибка',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SENDING: 'bg-blue-100 text-blue-700',
  SENT: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

function initialTemplateId(broadcast: BroadcastData): string {
  const match = broadcast.templateName ? getBroadcastTemplate(broadcast.templateName) : null;
  return (match ?? BROADCAST_TEMPLATES[0]).id;
}

function initialValues(broadcast: BroadcastData, templateId: string): string[] {
  const template = getBroadcastTemplate(templateId)!;
  if (broadcast.templateVariables && broadcast.templateName === templateId) {
    return template.fields.map((_, i) => broadcast.templateVariables?.[i] ?? '');
  }
  return template.fields.map((_, i) => (i === 0 ? broadcast.messageText || '' : ''));
}

function ProgressCard({ stats }: { stats: Stats }) {
  const sent = (stats.counts.SENT || 0) + (stats.counts.DELIVERED || 0) + (stats.counts.READ || 0);
  const pending = (stats.counts.PENDING || 0) + (stats.counts.FAILED_RETRY || 0);
  const permanent = stats.counts.FAILED_PERMANENT || 0;
  const skipped = stats.counts.SKIPPED || 0;
  const done = sent + permanent + skipped;
  const pct = stats.total ? Math.floor((done / stats.total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Прогресс кампании</p>
          <p className="text-sm text-gray-500">
            {done.toLocaleString('ru-RU')} / {stats.total.toLocaleString('ru-RU')} ({pct}%)
          </p>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="bg-green-50 rounded-lg py-2">
          <p className="text-lg font-bold text-green-700">{sent.toLocaleString('ru-RU')}</p>
          <p className="text-xs text-green-600">Доставлено</p>
        </div>
        <div className="bg-blue-50 rounded-lg py-2">
          <p className="text-lg font-bold text-blue-700">{pending.toLocaleString('ru-RU')}</p>
          <p className="text-xs text-blue-600">В очереди</p>
        </div>
        <div className="bg-red-50 rounded-lg py-2">
          <p className="text-lg font-bold text-red-700">{permanent.toLocaleString('ru-RU')}</p>
          <p className="text-xs text-red-600">Отклонено</p>
        </div>
        <div className="bg-gray-50 rounded-lg py-2">
          <p className="text-lg font-bold text-gray-700">{skipped.toLocaleString('ru-RU')}</p>
          <p className="text-xs text-gray-500">Пропущено</p>
        </div>
      </div>
    </div>
  );
}

export function BroadcastEditForm({
  broadcast,
  branches,
  stats,
  audienceCount,
  recipients,
  truncated,
  limit,
}: {
  broadcast: BroadcastData;
  branches: Branch[];
  stats: Stats;
  audienceCount: number;
  recipients: Recipient[];
  truncated: boolean;
  limit: number;
}) {
  const router = useRouter();
  const isDraft = broadcast.status === 'DRAFT';
  const isRunning = broadcast.status === 'SENDING';
  const [filter, setFilter] = useState(broadcast.targetFilter);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [templateId, setTemplateId] = useState(() => initialTemplateId(broadcast));
  const template = getBroadcastTemplate(templateId)!;
  const [values, setValues] = useState<string[]>(() => initialValues(broadcast, templateId));
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  // Auto-refresh while a campaign is running so the progress bar updates.
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(timer);
  }, [isRunning, router]);

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
        router.refresh();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  async function runAction(name: string, fn: () => Promise<any>, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    setBusyAction(name);
    try {
      const result = await fn();
      setLastResult(result);
      if (result?.error) {
        alert(result.error);
      }
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBusyAction(null);
    }
  }

  const readOnly = !isDraft;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {isDraft ? 'Редактировать рассылку' : broadcast.title}
        </h1>
        <span
          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[broadcast.status] || 'bg-gray-100 text-gray-600'
          }`}
        >
          {statusLabels[broadcast.status] || broadcast.status}
        </span>
      </div>

      {/* Campaign progress — only meaningful once the snapshot exists */}
      {stats.total > 0 && <ProgressCard stats={stats} />}

      {/* Per-recipient list. Hidden for drafts (no snapshot yet). */}
      {recipients.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-gray-700">
              Получатели ({recipients.length.toLocaleString('ru-RU')}
              {truncated ? ` из ${stats.total.toLocaleString('ru-RU')}` : ''})
            </p>
            {truncated && (
              <p className="text-xs text-gray-500">Показаны первые {limit.toLocaleString('ru-RU')} записей</p>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Телефон</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Имя</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Статус</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Отправлено</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Прочитано</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Ошибка</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{r.phone}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{r.name || '—'}</td>
                    <td className="px-4 py-2 text-xs">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full font-medium ${
                          recipientStatusColors[r.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {recipientStatusLabels[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {r.sentAt ? <LocalTime iso={r.sentAt} /> : '—'}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {r.readAt ? <LocalTime iso={r.readAt} /> : '—'}
                    </td>
                    <td
                      className="px-4 py-2 text-xs text-red-600 max-w-[220px] truncate"
                      title={r.errorMessage || ''}
                    >
                      {r.errorMessage || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview always visible — recipient view */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <p className="text-sm font-medium text-gray-500">Превью — как получит клиент</p>
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-3 text-sm text-gray-800 whitespace-pre-wrap break-words min-h-[6rem]">
          {preview}
        </div>
      </div>

      {/* Send / retry / cancel controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <p className="text-sm font-medium text-gray-700">Действия</p>

        {isDraft && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              По вашему фильтру найдено <b>{audienceCount.toLocaleString('ru-RU')}</b> клиентов.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  runAction(
                    'test',
                    () => startTestBatch(broadcast.id),
                    'Отправить пробную рассылку на первые 20 клиентов?'
                  )
                }
                disabled={busyAction !== null || audienceCount === 0}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Отправить пробную (20)
              </button>
              <button
                onClick={() =>
                  runAction(
                    'all',
                    () => startFullCampaign(broadcast.id),
                    `Отправить рассылку всем ${audienceCount.toLocaleString('ru-RU')} клиентам? Это займёт несколько дней и не отменяется.`
                  )
                }
                disabled={busyAction !== null || audienceCount === 0}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Отправить всем ({audienceCount.toLocaleString('ru-RU')})
              </button>
            </div>
            <p className="text-xs text-gray-500">
              WhatsApp ограничивает ~900 сообщений в сутки — крупная рассылка растянется на несколько дней. Прогресс будет виден на этой странице.
            </p>
          </div>
        )}

        {isRunning && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                runAction('retry', () => retryFailedRecipients(broadcast.id))
              }
              disabled={busyAction !== null || (stats.counts.FAILED_RETRY || 0) === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Повторить неудачные ({stats.counts.FAILED_RETRY || 0})
            </button>
            <button
              onClick={() =>
                runAction(
                  'cancel',
                  () => cancelBroadcast(broadcast.id),
                  'Прервать кампанию? Оставшиеся получатели не получат сообщение.'
                )
              }
              disabled={busyAction !== null}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              Прервать
            </button>
          </div>
        )}

        {!isDraft && !isRunning && (stats.counts.FAILED_RETRY || 0) > 0 && (
          <button
            onClick={() =>
              runAction('retry', () => retryFailedRecipients(broadcast.id))
            }
            disabled={busyAction !== null}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Повторить неудачные ({stats.counts.FAILED_RETRY})
          </button>
        )}
      </div>

      {/* Editable form — only for DRAFT */}
      {readOnly ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Шаблон</p>
            <p className="text-sm text-gray-900">{template.displayName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Аудитория</p>
              <p className="text-sm text-gray-900">
                {broadcast.targetFilter === 'ALL'
                  ? 'Все клиенты'
                  : broadcast.targetFilter === 'BRANCH'
                  ? broadcast.targetBranch?.name || 'Филиал'
                  : 'Подписчики'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Дата запуска</p>
              <p className="text-sm text-gray-900">
                <LocalTime iso={(broadcast.sentAt ?? broadcast.createdAt) as unknown as string} />
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/broadcasts')}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
          >
            Назад к рассылкам
          </button>
        </div>
      ) : (
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
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Сохранить изменения
              </button>
              <button
                type="button"
                onClick={() => router.push('/broadcasts')}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Назад
              </button>
              {saved && <span className="text-sm text-green-600">Сохранено</span>}
            </div>
          </form>
        </div>
      )}

      {lastResult?.snapshotted && (
        <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
          Запустили: снимок {lastResult.snapshotted.toLocaleString('ru-RU')} получателей. Начинаем отправку — прогресс обновляется автоматически.
        </p>
      )}
    </div>
  );
}
