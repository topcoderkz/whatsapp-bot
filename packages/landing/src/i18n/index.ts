import type { LandingTranslations, Locale } from './types';
import { kk } from './kk';
import { ru } from './ru';
import { en } from './en';

const dictionaries: Record<Locale, LandingTranslations> = { kk, ru, en };

export const LOCALES: Locale[] = ['kk', 'ru', 'en'];
export const DEFAULT_LOCALE: Locale = 'ru';

export function getDictionary(locale: string): LandingTranslations {
  return dictionaries[locale as Locale] || dictionaries.ru;
}

export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export type { LandingTranslations, Locale };
