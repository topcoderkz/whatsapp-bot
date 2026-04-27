import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '100% Fitness — Админ панель',
  description: 'Управление фитнес-клубом',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
