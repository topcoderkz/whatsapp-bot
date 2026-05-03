'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { SectionWrapper } from './section-wrapper';
import { ClassCard } from './class-card';
import type { LandingTranslations } from '@/i18n/types';

type Branch = { id: number; name: string };
type GroupClass = {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  schedule: unknown;
  trainer: { name: string } | null;
  branch: { id: number; name: string };
};

export function GroupClasses({
  branches,
  classes,
  dict,
}: {
  branches: Branch[];
  classes: GroupClass[];
  dict: LandingTranslations;
}) {
  const [activeBranch, setActiveBranch] = useState<number | null>(null);

  const filtered = activeBranch
    ? classes.filter((c) => c.branch.id === activeBranch)
    : classes;

  return (
    <SectionWrapper id="classes" alternate>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">
          {dict.classes.title}
        </h2>
        <p className="mt-4 text-lg text-gray-400">{dict.classes.subtitle}</p>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-gray-400 text-lg">{dict.classes.placeholder}</p>
        </div>
      ) : (
        <>
          {/* Branch filter */}
          <div className="flex overflow-x-auto sm:flex-wrap sm:justify-center gap-2 mb-10 pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            <button
              onClick={() => setActiveBranch(null)}
              className={clsx(
                'shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-colors',
                activeBranch === null
                  ? 'bg-brand text-white'
                  : 'bg-surface-card text-gray-400 border border-border-subtle hover:text-white'
              )}
            >
              {dict.classes.all_branches}
            </button>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBranch(b.id)}
                className={clsx(
                  'shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-colors',
                  b.id === activeBranch
                    ? 'bg-brand text-white'
                    : 'bg-surface-card text-gray-400 border border-border-subtle hover:text-white'
                )}
              >
                {b.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((gc) => (
              <ClassCard key={gc.id} groupClass={gc} dict={dict} />
            ))}
          </div>
        </>
      )}
    </SectionWrapper>
  );
}
