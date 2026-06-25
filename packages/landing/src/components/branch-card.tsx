import Link from 'next/link';
import { BranchGallery } from './branch-gallery';
import type { LandingTranslations } from '@/i18n/types';
import { BRANCH_FALLBACK_IMAGES, getMapUrl } from '@/lib/branch-meta';

type BranchPhoto = {
  id: number;
  imageUrl: string;
  displayOrder: number;
};

type Branch = {
  id: number;
  slug: string;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  photos: BranchPhoto[];
};

export function BranchCard({ branch, dict, locale }: { branch: Branch; dict: LandingTranslations; locale: string }) {
  const mapUrl = getMapUrl(branch.address);
  const hasGallery = branch.photos.length > 0;
  const fallbackImage = BRANCH_FALLBACK_IMAGES[branch.address];

  return (
    <div className="relative bg-surface-card border border-border-subtle rounded-2xl overflow-hidden hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10 transition-all group">
      {/* Stretched link — covers the whole card. Inner interactive elements
          (gallery thumbnails, phone, 2GIS) sit on top via z-20. */}
      <Link
        href={`/${locale}/branch/${branch.slug}`}
        aria-label={`${branch.name} — ${dict.branches.view_details}`}
        className="absolute inset-0 z-10"
      />

      {/* Gallery — z-20 so its modal-trigger clicks fire instead of navigating */}
      {hasGallery ? (
        <div className="relative z-20">
          <BranchGallery photos={branch.photos} branchName={branch.name} dict={dict} />
        </div>
      ) : (
        <div className="h-48 overflow-hidden relative">
          {fallbackImage ? (
            <img
              src={fallbackImage}
              alt={branch.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand/10 via-surface-2 to-surface-card flex items-center justify-center">
              <svg className="w-10 h-10 text-brand/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="p-6 -mt-8 relative">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
            📍
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-brand transition-colors">
              {branch.name}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{branch.address}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">{dict.branches.phone}:</span>
            <a
              href={`tel:${branch.phone}`}
              className="relative z-20 text-gray-300 hover:text-brand transition-colors"
            >
              {branch.phone}
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">{dict.branches.hours}:</span>
            <span className="text-gray-300">{branch.workingHours}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-20 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-brand transition-colors"
          >
            {dict.branches.view_map} — 2GIS
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <span className="inline-flex items-center gap-1 text-sm text-gray-500 group-hover:text-brand transition-colors">
            {dict.branches.view_details}
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
