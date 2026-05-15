import { BranchGallery } from './branch-gallery';
import type { LandingTranslations } from '@/i18n/types';

type BranchPhoto = {
  id: number;
  imageUrl: string;
  displayOrder: number;
};

type Branch = {
  id: number;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  photos: BranchPhoto[];
};

// Fallback images for branches without uploaded gallery photos
const BRANCH_IMAGES: Record<string, string> = {
  'Байзакова 280, 3 этаж': '/images/branches/baizakova.jpg',
  'Кожамкулова 136': '/images/branches/kozhamkulova.jpg',
  'Кабанбай батыра 147': '/images/branches/kabanbai.jpg',
  'Макатаева 45, 3 этаж': '/images/branches/makataeva.jpg',
};

// Map branch addresses to their direct 2GIS short links
const GIS_LINKS: Record<string, string> = {
  'Байзакова 280, 3 этаж': 'https://go.2gis.com/bLzQu',
  'Кожамкулова 136': 'https://go.2gis.com/Ocamg',
  'Кабанбай батыра 147': 'https://go.2gis.com/3eviR',
  'Макатаева 45, 3 этаж': 'https://go.2gis.com/ELcw6',
};

function getMapUrl(address: string): string {
  return GIS_LINKS[address] || `https://2gis.kz/almaty/search/${encodeURIComponent(address)}`;
}

export function BranchCard({ branch, dict }: { branch: Branch; dict: LandingTranslations }) {
  const mapUrl = getMapUrl(branch.address);
  const hasGallery = branch.photos.length > 0;
  const fallbackImage = BRANCH_IMAGES[branch.address];

  return (
    <div className="bg-surface-card border border-border-subtle rounded-2xl overflow-hidden hover:border-brand/50 transition-all group">
      {/* Gallery or fallback single image */}
      {hasGallery ? (
        <BranchGallery photos={branch.photos} branchName={branch.name} dict={dict} />
      ) : (
        <div className="h-48 overflow-hidden relative">
          {fallbackImage ? (
            <img
              src={fallbackImage}
              alt={branch.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand/10 via-surface-2 to-surface-card flex items-center justify-center">
              <svg className="w-10 h-10 text-brand/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          {/* Dark overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="p-6 -mt-8 relative">
        {/* Header with orange accent */}
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
            📍
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{branch.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{branch.address}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">{dict.branches.phone}:</span>
            <a href={`tel:${branch.phone}`} className="text-gray-300 hover:text-brand transition-colors">
              {branch.phone}
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">{dict.branches.hours}:</span>
            <span className="text-gray-300">{branch.workingHours}</span>
          </div>
        </div>

        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm text-brand hover:text-brand-light transition-colors"
        >
          {dict.branches.view_map} — 2GIS
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
