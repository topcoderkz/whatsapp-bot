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

export type { Language, Translations };
export { ru, kk, en };
