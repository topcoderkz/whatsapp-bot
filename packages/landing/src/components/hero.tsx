import type { LandingTranslations } from '@/i18n/types';
import { ActionTiles } from './action-tiles';

export function Hero({ dict, locale }: { dict: LandingTranslations; locale: string }) {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-1 via-surface-1 to-brand/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,107,0,0.12),transparent_70%)]" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-[10%] w-72 h-72 bg-brand/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-[5%] w-96 h-96 bg-brand/3 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-10 md:pt-32 md:pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/30 text-brand text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
          {dict.hero.badge}
        </div>

        <ActionTiles dict={dict} locale={locale} />
      </div>
    </section>
  );
}
