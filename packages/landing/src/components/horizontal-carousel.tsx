'use client';

import { Children, useCallback, useEffect, useRef, useState } from 'react';

/**
 * Reusable horizontal scroll-snap carousel with dot indicator.
 *
 * Each direct child renders as one slide. The component wraps every child in
 * a shrink-0 snap-center container so cards keep a consistent width across
 * viewports and swipe naturally on touch devices.
 *
 * Consumers can override the per-item width via `itemClassName` when their
 * cards need different proportions than the branches default.
 */
export function HorizontalCarousel({
  children,
  itemClassName = 'w-[86%] sm:w-[70%] md:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]',
  dotAriaLabel,
}: {
  children: React.ReactNode;
  itemClassName?: string;
  dotAriaLabel?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = Children.toArray(children);
  itemRefs.current = itemRefs.current.slice(0, items.length);

  // Active dot = whichever slide's center is nearest the scroller's viewport
  // centerline. Robust on touch (snap-locked), on trackpad (free-scroll), and
  // on programmatic scrolls triggered by dot clicks.
  const handleScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;
    let bestIndex = 0;
    let bestDistance = Infinity;
    itemRefs.current.forEach((card, i) => {
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
  }, [handleScroll, items.length]);

  const scrollToIndex = (i: number) => {
    const card = itemRefs.current[i];
    const scroller = scrollerRef.current;
    if (!card || !scroller) return;
    const target = card.offsetLeft - (scroller.clientWidth - card.clientWidth) / 2;
    scroller.scrollTo({ left: target, behavior: 'smooth' });
  };

  return (
    <>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pb-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((child, i) => (
          <div
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={`shrink-0 snap-center ${itemClassName}`}
          >
            {child}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={dotAriaLabel ? `${dotAriaLabel} — ${i + 1}` : `Слайд ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                activeIndex === i ? 'w-8 bg-brand' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
