import type { LandingTranslations } from '@/i18n/types';

type Trainer = {
  id: number;
  name: string;
  specialization: string | null;
  photoUrl: string | null;
  experienceYears: number | null;
  branch: { name: string };
};

export function TrainerCard({ trainer, dict }: { trainer: Trainer; dict: LandingTranslations }) {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-2xl overflow-hidden hover:border-brand/50 transition-all group">
      {/* Photo area */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-surface-2 to-surface-card flex items-center justify-center overflow-hidden">
        {trainer.photoUrl ? (
          <img
            src={trainer.photoUrl}
            alt={trainer.name}
            className="w-full h-full object-contain bg-surface-2 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-brand/5 rounded-full blur-2xl scale-150" />
            <svg className="w-24 h-24 text-gray-600 relative" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}
        {/* Orange gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface-card to-transparent" />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white">{trainer.name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{trainer.branch.name}</p>

        {trainer.specialization && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-brand">🎯</span>
            <span className="text-gray-300">{trainer.specialization}</span>
          </div>
        )}

        {trainer.experienceYears && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-brand/10 text-brand text-xs font-bold px-3 py-1 rounded-full">
            {trainer.experienceYears} {dict.trainers.years}
          </div>
        )}
      </div>
    </div>
  );
}
