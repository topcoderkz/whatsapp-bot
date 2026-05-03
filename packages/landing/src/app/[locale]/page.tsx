import { getDictionary, isValidLocale } from '@/i18n';
import { getBranches, getMemberships, getTrainers, getGroupClasses, getActivePromotions } from '@/lib/data';
import { Hero } from '@/components/hero';
import { About } from '@/components/about';
import { Branches } from '@/components/branches';
import { Pricing } from '@/components/pricing';
import { Trainers } from '@/components/trainers';
import { GroupClasses } from '@/components/group-classes';
import { Promotions } from '@/components/promotions';
import { ContactCta } from '@/components/contact-cta';

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? locale : 'kk';
  const dict = getDictionary(validLocale);

  const [branches, memberships, trainers, groupClasses, promotions] = await Promise.all([
    getBranches(),
    getMemberships(),
    getTrainers(),
    getGroupClasses(),
    getActivePromotions(),
  ]);

  return (
    <main>
      <Hero dict={dict} />
      <About dict={dict} />
      <Branches branches={branches} dict={dict} />
      <Pricing
        branches={branches.map((b) => ({ id: b.id, name: b.name }))}
        memberships={memberships as any}
        dict={dict}
      />
      <Trainers trainers={trainers as any} dict={dict} />
      <GroupClasses
        branches={branches.map((b) => ({ id: b.id, name: b.name }))}
        classes={groupClasses as any}
        dict={dict}
      />
      <Promotions promotions={promotions as any} dict={dict} locale={validLocale} />
      <ContactCta branches={branches} dict={dict} />
    </main>
  );
}
