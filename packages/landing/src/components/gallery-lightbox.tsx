'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface GalleryLightboxProps {
  photos: Array<{ id: number; imageUrl: string }>;
  branchName: string;
  onClose: () => void;
}

export function GalleryLightbox({ photos, branchName, onClose }: GalleryLightboxProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={onClose}>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/10">
        <div className="text-white">
          <h2 className="text-lg font-bold">{branchName}</h2>
          <p className="text-sm text-white/50">{photos.length} фото</p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable photo grid */}
      <div
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-5xl mx-auto columns-1 md:columns-2 gap-4 space-y-4">
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.imageUrl}
              alt=""
              className="w-full rounded-lg break-inside-avoid"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
