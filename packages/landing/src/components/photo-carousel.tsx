'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

interface PhotoCarouselProps {
  photos: { id: number | string; imageUrl: string }[];
  branchName: string;
  fallback?: string;
}

/**
 * Mobile-friendly photo carousel:
 *  - CSS scroll-snap so swipes settle on whole photos
 *  - Tracks which slide is centered via IntersectionObserver and
 *    drives the dot indicator below
 *  - No modal — inline, like an Instagram post
 */
export function PhotoCarousel({ photos, branchName, fallback }: PhotoCarouselProps) {
  const slides = photos.length > 0
    ? photos.map((p) => ({ key: String(p.id), src: p.imageUrl }))
    : fallback
      ? [{ key: 'fallback', src: fallback }]
      : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = itemRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    itemRefs.current.forEach((item) => item && observer.observe(item));
    return () => observer.disconnect();
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div>
      <div
        ref={containerRef}
        className="-mx-4 px-4 overflow-x-auto snap-x snap-mandatory flex gap-3 scrollbar-none pb-2"
      >
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="shrink-0 w-[88%] aspect-[4/3] snap-center rounded-2xl overflow-hidden bg-surface-2"
          >
            <img
              src={slide.src}
              alt={branchName}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <div
              key={i}
              aria-hidden
              className={clsx(
                'h-1.5 rounded-full transition-all duration-200',
                i === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/30'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
