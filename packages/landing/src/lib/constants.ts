export const WHATSAPP_NUMBER = '77086406121';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const INSTAGRAM_URL = 'https://www.instagram.com/100_fitness_gym/';
export const THREADS_URL = 'https://www.threads.com/@100_fitness_gym';

export const APP_STORE_URL = 'https://apps.apple.com/kz/app/100-fitness-gym/id6745477964';
export const RUSTORE_URL = 'https://www.rustore.ru/catalog/app/com.mobifitness.fitness100gym307386';

// Pre-filled greeting per locale — triggers bot's language selection flow
const WHATSAPP_GREETINGS: Record<string, string> = {
  kk: 'Сәлем',
  ru: 'Привет',
  en: 'Hello',
};

export function getWhatsAppUrl(locale?: string): string {
  const greeting = WHATSAPP_GREETINGS[locale || 'ru'] || WHATSAPP_GREETINGS.ru;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(greeting)}`;
}

export const BRAND = {
  name: '100% Fitness Gym',
  city: 'Almaty',
} as const;
