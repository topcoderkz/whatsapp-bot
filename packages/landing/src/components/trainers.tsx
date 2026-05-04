'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { SectionWrapper } from './section-wrapper';
import { TrainerCard } from './trainer-card';
import type { LandingTranslations } from '@/i18n/types';

type Branch = { id: number; name: string };
type Trainer = {
  id: number;
  name: string;
  specialization: string | null;
  photoUrl: string | null;
  experienceYears: number | null;
  branch: { id: number; name: string };
};

function getDefaultBranch(branches: Branch[]): number | null {
  const bayzakova = branches.find((b) => b.name.includes('Байзакова'));
  return bayzakova?.id ?? branches[0]?.id ?? null;
}

export function Trainers({
  branches,
  trainers,
  dict,
}: {
  branches: Branch[];
  trainers: Trainer[];
  dict: LandingTranslations;
}) {
  const [activeBranch, setActiveBranch] = useState<number | null>(() => getDefaultBranch(branches));

  const filtered = activeBranch
    ? trainers.filter((t) => t.branch.id === activeBranch)
    : trainers;

  return (
    <SectionWrapper id="trainers">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">
          {dict.trainers.title}
        </h2>
        <p className="mt-4 text-lg text-gray-400">{dict.trainers.subtitle}</p>
      </div>

      {/* Branch tabs */}
      <div className="flex overflow-x-auto sm:flex-wrap sm:justify-center gap-2 mb-10 pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {branches.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveBranch(b.id)}
            className={clsx(
              'shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-colors',
              b.id === activeBranch
                ? 'bg-brand text-white'
                : 'bg-surface-card text-gray-400 border border-border-subtle hover:text-white hover:border-brand/50'
            )}
          >
            {b.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">👨‍🏫</div>
          <p className="text-gray-400 text-lg">{dict.trainers.placeholder}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} dict={dict} />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
