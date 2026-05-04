export const WHATSAPP_NUMBER = '77086406121';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const INSTAGRAM_URL = 'https://www.instagram.com/100_fitness_gym/';
export const THREADS_URL = 'https://www.threads.com/@100_fitness_gym';

// Pre-filled greeting per locale — triggers bot's language selection flow
const WHATSAPP_GREETINGS: Record<string, string> = {
  kk: 'Сәлем',
  ru: 'Привет',
  en: 'Hello',
};

export function getWhatsAppUrl(locale?: string): string {
  const greeting = WHATSAPP_GREETINGS[locale || 'kk'] || WHATSAPP_GREETINGS.kk;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(greeting)}`;
}

export const BRAND = {
  name: '100% Fitness Gym',
  city: 'Almaty',
} as const;
