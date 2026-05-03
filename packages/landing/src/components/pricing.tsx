'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { SectionWrapper } from './section-wrapper';
import { PricingTable } from './pricing-table';
import type { LandingTranslations } from '@/i18n/types';
import { WHATSAPP_URL } from '@/lib/constants';

type Branch = { id: number; name: string };
type Membership = {
  id: number;
  type: string;
  price: number;
  timeRange: string | null;
  branch: { id: number; name: string };
};

export function Pricing({
  branches,
  memberships,
  dict,
}: {
  branches: Branch[];
  memberships: Membership[];
  dict: LandingTranslations;
}) {
  const [activeBranch, setActiveBranch] = useState(branches[0]?.id ?? 0);

  const filtered = memberships.filter((m) => m.branch.id === activeBranch);

  return (
    <SectionWrapper id="pricing" alternate>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">
          {dict.pricing.title}
        </h2>
        <p className="mt-4 text-lg text-gray-400">{dict.pricing.subtitle}</p>
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

      {/* Price table */}
      <div className="bg-surface-card border border-border-subtle rounded-2xl overflow-hidden">
        <PricingTable memberships={filtered} dict={dict} />
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand text-white font-bold px-8 py-4 rounded-full hover:bg-brand-hover transition-colors"
        >
          {dict.pricing.contact_cta}
        </a>
      </div>
    </SectionWrapper>
  );
}
