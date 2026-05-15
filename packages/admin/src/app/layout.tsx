import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '100% Fitness — Админ панель',
  description: 'Управление фитнес-клубом',
  other: {
    google: 'notranslate',
    yandex: 'notranslate',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" translate="no" className="notranslate">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
