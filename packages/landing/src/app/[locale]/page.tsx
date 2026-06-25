import { getDictionary, isValidLocale } from '@/i18n';
import { getBranches, getActivePromotions } from '@/lib/data';
import { Hero } from '@/components/hero';
import { Branches } from '@/components/branches';
import { Promotions } from '@/components/promotions';
import { ContactCta } from '@/components/contact-cta';

export const dynamic = 'force-dynamic';

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? locale : 'ru';
  const dict = getDictionary(validLocale);

  const [branches, promotions] = await Promise.all([
    getBranches(),
    getActivePromotions(),
  ]);

  return (
    <main>
      <Hero dict={dict} locale={validLocale} />
      <Branches branches={branches} dict={dict} locale={validLocale} />
      <Promotions promotions={promotions as any} dict={dict} locale={validLocale} />
      <ContactCta branches={branches} dict={dict} locale={validLocale} />
    </main>
  );
}
