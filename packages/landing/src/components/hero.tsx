import type { LandingTranslations } from '@/i18n/types';
import { WHATSAPP_URL } from '@/lib/constants';

export function Hero({ dict }: { dict: LandingTranslations }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-1 via-surface-1 to-brand/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,107,0,0.12),transparent_70%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-1 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-[10%] w-72 h-72 bg-brand/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-[5%] w-96 h-96 bg-brand/3 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
          100% Fitness Gym — Almaty
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight max-w-4xl mx-auto">
          {dict.hero.headline.split(' ').map((word, i) => (
            <span key={i}>
              {word.includes('100%') || word.includes('фитнес') || word.includes('Fitness') || word.includes('берілу') || word.includes('отдача') || word.includes('Committed')
                ? <span className="text-brand">{word}</span>
                : word}
              {' '}
            </span>
          ))}
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {dict.hero.subheadline}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mx-auto">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-brand text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-brand-hover transition-all hover:scale-105 shadow-lg shadow-brand/25"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {dict.hero.cta}
          </a>
          <a
            href="#pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-gray-300 font-bold text-lg px-8 py-4 rounded-full border border-border-subtle hover:border-brand/50 hover:text-white transition-colors"
          >
            {dict.hero.cta_secondary}
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
