import { SectionWrapper } from './section-wrapper';
import { PromoCard } from './promo-card';
import { HorizontalCarousel } from './horizontal-carousel';
import type { LandingTranslations } from '@/i18n/types';

type Promotion = {
  id: number;
  title: string;
  description: string;
  conditions: string | null;
  imageUrl: string | null;
  endDate: Date;
  branches?: { id: number; name: string }[];
};

export function Promotions({
  promotions,
  dict,
  locale,
}: {
  promotions: Promotion[];
  dict: LandingTranslations;
  locale: string;
}) {
  return (
    <SectionWrapper id="promotions">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">
          {dict.promotions.title}
        </h2>
        <p className="mt-3 text-base md:text-lg text-gray-400">{dict.promotions.subtitle}</p>
      </div>

      {promotions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎁</div>
          <p className="text-gray-400 text-lg">{dict.promotions.placeholder}</p>
        </div>
      ) : (
        <HorizontalCarousel dotAriaLabel={dict.promotions.title}>
          {promotions.map((promo) => (
            <PromoCard key={promo.id} promo={promo} dict={dict} locale={locale} showBranches />
          ))}
        </HorizontalCarousel>
      )}
    </SectionWrapper>
  );
}
