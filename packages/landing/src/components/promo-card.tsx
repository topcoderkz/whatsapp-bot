import type { LandingTranslations } from '@/i18n/types';

type Promotion = {
  id: number;
  title: string;
  description: string;
  conditions: string | null;
  imageUrl: string | null;
  endDate: Date;
};

export function PromoCard({ promo, dict, locale }: { promo: Promotion; dict: LandingTranslations; locale: string }) {
  const endDate = new Date(promo.endDate).toLocaleDateString(
    locale === 'en' ? 'en-US' : locale === 'kk' ? 'kk-KZ' : 'ru-RU',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  return (
    <div className="bg-surface-card border border-border-subtle rounded-2xl overflow-hidden hover:border-brand/50 transition-colors">
      <div className="h-48 bg-gradient-to-br from-surface-2 to-surface-card overflow-hidden flex items-center justify-center">
        {promo.imageUrl ? (
          <img
            src={promo.imageUrl}
            alt={promo.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-5xl opacity-30">🎁</div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-white">{promo.title}</h3>
        <p className="mt-2 text-sm text-gray-400">{promo.description}</p>

        {promo.conditions && (
          <div className="mt-3 text-xs text-gray-500">
            <span className="font-bold">{dict.promotions.conditions}</span> {promo.conditions}
          </div>
        )}

        <div className="mt-4 inline-flex items-center gap-1.5 bg-brand/10 text-brand text-xs font-bold px-3 py-1.5 rounded-full">
          {dict.promotions.valid_until} {endDate}
        </div>
      </div>
    </div>
  );
}
