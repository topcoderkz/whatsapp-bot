import { SectionWrapper } from './section-wrapper';
import { PromoCard } from './promo-card';
import type { LandingTranslations } from '@/i18n/types';

type Promotion = {
  id: number;
  title: string;
  description: string;
  conditions: string | null;
  imageUrl: string | null;
  endDate: Date;
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
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">
          {dict.promotions.title}
        </h2>
        <p className="mt-4 text-lg text-gray-400">{dict.promotions.subtitle}</p>
      </div>

      {promotions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎁</div>
          <p className="text-gray-400 text-lg">{dict.promotions.placeholder}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <PromoCard key={promo.id} promo={promo} dict={dict} locale={locale} />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
