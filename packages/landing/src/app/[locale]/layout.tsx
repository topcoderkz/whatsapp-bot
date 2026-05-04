import { Inter } from 'next/font/google';
import { getDictionary, isValidLocale } from '@/i18n';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { WhatsAppFab } from '@/components/whatsapp-fab';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export function generateStaticParams() {
  return [{ locale: 'kk' }, { locale: 'ru' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      type: 'website',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? locale : 'kk';
  const dict = getDictionary(validLocale);

  return (
    <html lang={validLocale} className={inter.className}>
      <body className="bg-surface-1 text-gray-200 antialiased">
        <Navbar dict={dict} locale={validLocale} />
        {children}
        <Footer dict={dict} locale={validLocale} />
        <WhatsAppFab locale={validLocale} />
      </body>
    </html>
  );
}
