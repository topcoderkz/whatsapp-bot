import { SectionWrapper } from './section-wrapper';
import { TrainerCard } from './trainer-card';
import type { LandingTranslations } from '@/i18n/types';

type Trainer = {
  id: number;
  name: string;
  specialization: string | null;
  photoUrl: string | null;
  experienceYears: number | null;
  branch: { name: string };
};

export function Trainers({ trainers, dict }: { trainers: Trainer[]; dict: LandingTranslations }) {
  return (
    <SectionWrapper id="trainers">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">
          {dict.trainers.title}
        </h2>
        <p className="mt-4 text-lg text-gray-400">{dict.trainers.subtitle}</p>
      </div>

      {trainers.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">👨‍🏫</div>
          <p className="text-gray-400 text-lg">{dict.trainers.placeholder}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} dict={dict} />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
