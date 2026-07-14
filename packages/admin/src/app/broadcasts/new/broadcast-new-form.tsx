'use client';

import { useState, useTransition } from 'react';
import { createBroadcast } from '@/lib/actions';
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
  const [filter, setFilter] = useState('ALL');
  const [templateId, setTemplateId] = useState(BROADCAST_TEMPLATES[0].id);
  const template = getBroadcastTemplate(templateId)!;
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
        router.push(`/broadcasts/${id}`);
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  return (
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

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Создание...' : 'Создать черновик и перейти к отправке'}
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Отправка не начнётся автоматически — на следующем экране вы увидите, сколько клиентов подходит под фильтр, и сможете сначала запустить пробную рассылку.
          </p>
        </div>
      </form>
    </div>
  );
}
