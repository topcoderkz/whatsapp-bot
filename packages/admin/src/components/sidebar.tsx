'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
  { href: '/', label: 'Панель управления', icon: '📊' },
  { href: '/branches', label: 'Филиалы', icon: '📍' },
  { href: '/pricing', label: 'Цены', icon: '💰' },
  { href: '/trainers', label: 'Тренеры', icon: '👨‍🏫' },
  { href: '/classes', label: 'Групповые', icon: '👥' },
  { href: '/promotions', label: 'Акции', icon: '🎁' },
  { href: '/bookings', label: 'Записи', icon: '📅' },
  { href: '/clients', label: 'Клиенты', icon: '👤' },
  { href: '/broadcasts', label: 'Рассылки', icon: '📨' },
  { href: '/admins', label: 'Администраторы', icon: '🛡️' },
  { href: '/settings', label: 'Настройки', icon: '⚙️' },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full p-4 flex flex-col">
      <div className="mb-8 px-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">100% Fitness</h1>
          <p className="text-xs text-gray-500">Админ панель</p>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400"
            aria-label="Закрыть меню"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <a
          href="/api/logout"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <span className="text-base">🚪</span>
          Выйти
        </a>
      </div>
    </aside>
  );
}
