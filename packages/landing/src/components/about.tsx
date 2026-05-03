import { SectionWrapper } from './section-wrapper';
import type { LandingTranslations } from '@/i18n/types';

const STATS_ICONS = ['🏢', '💰', '🕐', '💪'];

export function About({ dict }: { dict: LandingTranslations }) {
  const stats = [
    { value: dict.about.stat_branches, label: dict.about.stat_branches_desc, icon: STATS_ICONS[0] },
    { value: dict.about.stat_price, label: dict.about.stat_price_desc, icon: STATS_ICONS[1] },
    { value: dict.about.stat_schedule, label: dict.about.stat_schedule_desc, icon: STATS_ICONS[2] },
    { value: dict.about.stat_trainers, label: dict.about.stat_trainers_desc, icon: STATS_ICONS[3] },
  ];

  return (
    <SectionWrapper id="about" alternate>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">
          {dict.about.title}
        </h2>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          {dict.about.description}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-surface-card border border-border-subtle rounded-2xl p-6 md:p-8 text-center hover:border-brand/50 transition-colors group"
          >
            <div className="text-3xl mb-3">{stat.icon}</div>
            <div className="text-2xl md:text-3xl font-black text-brand">{stat.value}</div>
            <div className="mt-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
