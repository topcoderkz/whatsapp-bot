'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SectionWrapper } from './section-wrapper';
import { BranchCard } from './branch-card';
import type { LandingTranslations } from '@/i18n/types';

type Branch = {
  id: number;
  slug: string;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  photos: Array<{ id: number; imageUrl: string; displayOrder: number }>;
};

export function Branches({ branches, dict, locale }: { branches: Branch[]; dict: LandingTranslations; locale: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track which card is centered by picking the one closest to the scroller's centerline.
  const handleScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;
    let bestIndex = 0;
    let bestDistance = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(scrollerCenter - cardCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    });
    setActiveIndex(bestIndex);
  }, []);

  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  const scrollToIndex = (i: number) => {
    const card = cardRefs.current[i];
    const scroller = scrollerRef.current;
    if (!card || !scroller) return;
    const target = card.offsetLeft - (scroller.clientWidth - card.clientWidth) / 2;
    scroller.scrollTo({ left: target, behavior: 'smooth' });
  };

  return (
    <SectionWrapper id="branches">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">
          {dict.branches.title}
        </h2>
        <p className="mt-3 text-base md:text-lg text-gray-400">{dict.branches.subtitle}</p>
      </div>

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {branches.map((branch, i) => (
          <div
            key={branch.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="shrink-0 snap-center w-[86%] sm:w-[70%] md:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
          >
            <BranchCard branch={branch} dict={dict} locale={locale} />
          </div>
        ))}
      </div>

      {branches.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {branches.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`${dict.branches.title} — ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                activeIndex === i ? 'w-8 bg-brand' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
