'use client';

import { useState } from 'react';
import { GalleryLightbox } from './gallery-lightbox';
import type { LandingTranslations } from '@/i18n/types';

type BranchPhoto = { id: number; imageUrl: string; displayOrder: number };

interface BranchGalleryProps {
  photos: BranchPhoto[];
  branchName: string;
  dict: LandingTranslations;
}

export function BranchGallery({ photos, branchName, dict }: BranchGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (photos.length === 1) {
    return (
      <>
        <div className="h-56 overflow-hidden relative">
          <button onClick={() => setLightboxOpen(true)} className="w-full h-full cursor-pointer">
            <img
              src={photos[0].imageUrl}
              alt={branchName}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </button>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>
        {lightboxOpen && (
          <GalleryLightbox photos={photos} branchName={branchName} onClose={() => setLightboxOpen(false)} />
        )}
      </>
    );
  }

  if (photos.length === 2) {
    return (
      <>
        <div className="h-56 md:h-64 grid grid-cols-2 gap-0.5 overflow-hidden relative">
          {photos.map((photo, i) => (
            <button key={photo.id} onClick={() => setLightboxOpen(true)} className="overflow-hidden cursor-pointer">
              <img src={photo.imageUrl} alt={i === 0 ? branchName : ''} loading={i === 0 ? 'eager' : 'lazy'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </button>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>
        {lightboxOpen && (
          <GalleryLightbox photos={photos} branchName={branchName} onClose={() => setLightboxOpen(false)} />
        )}
      </>
    );
  }

  if (photos.length <= 4) {
    return (
      <>
        <div className="h-56 md:h-64 grid grid-cols-5 grid-rows-2 gap-0.5 overflow-hidden relative">
          <button onClick={() => setLightboxOpen(true)} className="col-span-3 row-span-2 overflow-hidden cursor-pointer">
            <img src={photos[0].imageUrl} alt={branchName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </button>
          {photos.slice(1).map((photo) => (
            <button key={photo.id} onClick={() => setLightboxOpen(true)} className="col-span-2 overflow-hidden cursor-pointer">
              <img src={photo.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </button>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>
        {lightboxOpen && (
          <GalleryLightbox photos={photos} branchName={branchName} onClose={() => setLightboxOpen(false)} />
        )}
      </>
    );
  }

  // 5+ photos: 1 large + 2x2 grid
  const displayPhotos = photos.slice(0, 5);
  const remainingCount = photos.length - 5;

  return (
    <>
      <div className="h-56 md:h-72 grid grid-cols-5 grid-rows-2 gap-0.5 overflow-hidden relative">
        <button onClick={() => setLightboxOpen(true)} className="col-span-3 row-span-2 overflow-hidden cursor-pointer">
          <img src={displayPhotos[0].imageUrl} alt={branchName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </button>

        <button onClick={() => setLightboxOpen(true)} className="col-span-1 overflow-hidden cursor-pointer">
          <img src={displayPhotos[1].imageUrl} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        </button>
        <button onClick={() => setLightboxOpen(true)} className="col-span-1 overflow-hidden cursor-pointer">
          <img src={displayPhotos[2].imageUrl} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        </button>

        <button onClick={() => setLightboxOpen(true)} className="col-span-1 overflow-hidden cursor-pointer">
          <img src={displayPhotos[3].imageUrl} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        </button>
        <button onClick={() => setLightboxOpen(true)} className="col-span-1 overflow-hidden cursor-pointer relative">
          <img src={displayPhotos[4].imageUrl} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          {remainingCount > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-lg font-bold">+{remainingCount}</span>
            </div>
          )}
        </button>

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white transition-colors flex items-center gap-1.5 shadow-lg"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          {dict.branches.show_all_photos}
        </button>
      </div>

      {lightboxOpen && (
        <GalleryLightbox photos={photos} branchName={branchName} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
