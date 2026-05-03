import type { Translations, Language } from './types';
import { ru } from './ru';
import { kk } from './kk';
import { en } from './en';

const translations: Record<Language, Translations> = { ru, kk, en };

export function t(lang: Language, path: string): string {
  const keys = path.split('.');
  let value: any = translations[lang];
  for (const key of keys) {
    value = value?.[key];
  }
  return value || path;
}

export function getDayNames(lang: Language): string[] {
  return translations[lang].dates.days_short.split(',');
}

export function getMonthNames(lang: Language): string[] {
  return translations[lang].dates.months_short.split(',');
}

export function formatLocalDate(lang: Language, date: Date): string {
  if (lang === 'en') {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (lang === 'kk') {
    // Kazakh date format: "4 мамыр 2026 ж."
    const months = getMonthNames(lang);
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ж.`;
  }
  return date.toLocaleDateString('ru-RU');
}

export type { Language, Translations };
export { ru, kk, en };
