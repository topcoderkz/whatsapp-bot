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

export function PromoCard({
  promo,
  dict,
  locale,
  showBranches = false,
}: {
  promo: Promotion;
  dict: LandingTranslations;
  locale: string;
  showBranches?: boolean;
}) {
  const endDate = new Date(promo.endDate).toLocaleDateString(
    locale === 'en' ? 'en-US' : locale === 'kk' ? 'kk-KZ' : 'ru-RU',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  return (
    <div className="h-full flex flex-col bg-surface-card border border-border-subtle rounded-2xl overflow-hidden hover:border-brand/50 transition-colors">
      <div className="h-48 shrink-0 bg-gradient-to-br from-surface-2 to-surface-card overflow-hidden flex items-center justify-center">
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

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-white">{promo.title}</h3>
        <p className="mt-2 text-sm text-gray-400">{promo.description}</p>

        {promo.conditions && (
          <div className="mt-3 text-xs text-gray-500">
            <span className="font-bold">{dict.promotions.conditions}</span> {promo.conditions}
          </div>
        )}

        <div className="mt-auto pt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-brand/10 text-brand text-xs font-bold px-3 py-1.5 rounded-full">
            {dict.promotions.valid_until} {endDate}
          </span>
          {showBranches && promo.branches && (
            promo.branches.length === 0 ? (
              <span className="inline-flex items-center gap-1.5 bg-surface-2 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full border border-border-subtle">
                {dict.promotions.all_branches}
              </span>
            ) : (
              promo.branches.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1 bg-surface-2 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full border border-border-subtle"
                >
                  <span className="text-brand">📍</span>
                  {b.name}
                </span>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
