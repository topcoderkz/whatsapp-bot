// Catalog of Meta-approved WhatsApp templates used for admin broadcasts.
// Every entry here must match a template registered in Meta Business Manager
// with the same name — Meta owns the body text; this file just describes the
// admin-facing form and preview.
//
// Adding a new template = register it with Meta AND add an entry here.
// Never send a template that's not `APPROVED` in Meta; the bot will get 132001-family
// errors otherwise.

export type BroadcastTemplateField = {
  // 1-based position matching {{n}} in the template body.
  variableIndex: number;
  label: string;
  placeholder?: string;
  // Meta rejects params > 60 chars for many template categories; set generously.
  maxLength: number;
  // If true, this field renders as a multi-line textarea (still gets sanitized).
  multiline?: boolean;
};

export type BroadcastTemplate = {
  // Stable identifier + exact Meta template name (kept identical to avoid drift).
  id: string;
  displayName: string;
  description: string;
  category: 'MARKETING' | 'UTILITY';
  // Body preview with {{1}}, {{2}}, ... placeholders. Used only for the admin
  // preview — the bot sends templateName + variables to Meta, and Meta renders
  // this exact body server-side.
  bodyTemplate: string;
  fields: BroadcastTemplateField[];
};

export const BROADCAST_TEMPLATES: BroadcastTemplate[] = [
  {
    id: 'broadcast_promo',
    displayName: 'Промо с ценой',
    description: 'Акция или спецпредложение со старой и новой ценой',
    category: 'MARKETING',
    bodyTemplate:
      '🎁 {{1}}\n\n{{2}}\n\n💰 {{3}} → {{4}}\nПодробности у менеджера.\n\n100% Fitness Gym',
    fields: [
      { variableIndex: 1, label: 'Заголовок акции', placeholder: 'Летние скидки', maxLength: 60 },
      {
        variableIndex: 2,
        label: 'Что предлагаете',
        placeholder: 'Полугодовой абонемент — скидка 20%',
        maxLength: 200,
      },
      { variableIndex: 3, label: 'Обычная цена', placeholder: '130 000 ₸', maxLength: 30 },
      { variableIndex: 4, label: 'Ваша цена', placeholder: '104 000 ₸', maxLength: 30 },
    ],
  },
  {
    id: 'broadcast_announce',
    displayName: 'Объявление',
    description: 'Общее объявление одним абзацем',
    category: 'MARKETING',
    bodyTemplate: '📢 {{1}}\n\nПодробности у менеджера.\n\n100% Fitness Gym',
    fields: [
      {
        variableIndex: 1,
        label: 'Текст объявления',
        placeholder: 'С 20 июля обновлённое расписание групповых занятий',
        maxLength: 400,
        multiline: true,
      },
    ],
  },
  {
    id: 'broadcast_event',
    displayName: 'Мероприятие',
    description: 'Приглашение на мероприятие / мастер-класс',
    category: 'MARKETING',
    bodyTemplate:
      '📅 Приглашаем вас на: {{1}}\n\n🗓 Дата и время: {{2}}\n📍 Место: {{3}}\n\nЖдём вас в 100% Fitness Gym! Подробности у менеджера.',
    fields: [
      { variableIndex: 1, label: 'Название мероприятия', placeholder: 'Мастер-класс по йоге', maxLength: 80 },
      { variableIndex: 2, label: 'Дата и время', placeholder: '15 июля, 19:00', maxLength: 40 },
      { variableIndex: 3, label: 'Место', placeholder: 'Байзакова 280', maxLength: 60 },
    ],
  },
  {
    id: 'broadcast_renewal',
    displayName: 'Продление абонемента',
    description: 'Напоминание клиенту об окончании абонемента',
    category: 'UTILITY',
    bodyTemplate:
      '👋 {{1}}!\n\nВаш абонемент в 100% Fitness Gym заканчивается {{2}}.\nСвяжитесь с менеджером для продления.',
    fields: [
      { variableIndex: 1, label: 'Имя клиента', placeholder: 'Иван', maxLength: 40 },
      { variableIndex: 2, label: 'Дата окончания', placeholder: '15 июля', maxLength: 30 },
    ],
  },
];

export function getBroadcastTemplate(id: string): BroadcastTemplate | undefined {
  return BROADCAST_TEMPLATES.find((t) => t.id === id);
}

// Render the template body with actual values, so admins see what the recipient will read.
export function renderBroadcastPreview(template: BroadcastTemplate, values: string[]): string {
  return template.bodyTemplate.replace(/\{\{(\d+)\}\}/g, (_, n) => {
    const idx = parseInt(n, 10) - 1;
    return values[idx] || `{{${n}}}`;
  });
}

// Auto-generate a short summary from the variables to store as messageText — used
// for the list view and search. First non-empty variable, truncated.
export function summarizeBroadcast(template: BroadcastTemplate, values: string[]): string {
  const first = values.find((v) => v && v.trim().length > 0) ?? '';
  return first.length > 120 ? first.slice(0, 117) + '…' : first;
}
