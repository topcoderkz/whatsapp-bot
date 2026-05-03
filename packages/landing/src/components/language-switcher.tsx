'use client';

import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

const localeLabels: Record<string, string> = {
  kk: 'KZ',
  ru: 'RU',
  en: 'EN',
};

export function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  }

  return (
    <div className="flex gap-1 bg-surface-card rounded-full p-1">
      {Object.entries(localeLabels).map(([key, label]) => (
        <button
          key={key}
          onClick={() => switchLocale(key)}
          className={clsx(
            'px-3 py-1 text-xs font-bold rounded-full transition-colors',
            key === locale
              ? 'bg-brand text-white'
              : 'text-gray-400 hover:text-white'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
