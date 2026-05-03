import type { LandingTranslations } from '@/i18n/types';

type Branch = {
  id: number;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
};

export function BranchCard({ branch, dict }: { branch: Branch; dict: LandingTranslations }) {
  const mapUrl = `https://2gis.kz/almaty/search/${encodeURIComponent(branch.address)}`;

  return (
    <div className="bg-surface-card border border-border-subtle rounded-2xl overflow-hidden hover:border-brand/50 transition-all group">
      {/* Placeholder image header */}
      <div className="h-32 bg-gradient-to-br from-brand/10 via-surface-2 to-surface-card flex items-center justify-center">
        <svg className="w-10 h-10 text-brand/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>

      <div className="p-6">
      {/* Header with orange accent */}
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center text-brand text-xl group-hover:bg-brand/20 transition-colors">
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
        {dict.branches.view_map}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
      </div>
    </div>
  );
}
