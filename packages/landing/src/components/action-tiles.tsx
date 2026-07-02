'use client';

import { useEffect, useState } from 'react';
import type { LandingTranslations } from '@/i18n/types';
import {
  APP_STORE_URL,
  INSTAGRAM_URL,
  RUSTORE_URL,
  getWhatsAppUrl,
} from '@/lib/constants';

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13m0 0l-5-5m5 5l5-5M5 21h14" />
    </svg>
  );
}

function AppStoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M17.523 15.3414c-.5511 0-.9991-.4486-.9991-.9997s.448-.9991.9991-.9991c.5511 0 .9991.448.9991.9991.0001.5511-.4479.9997-.9991.9997m-11.046 0c-.5511 0-.9991-.4486-.9991-.9997s.448-.9991.9991-.9991c.5511 0 .9991.448.9991.9991 0 .5511-.448.9997-.9991.9997m11.4045-6.02l1.9973-3.4592c.1141-.1981.0464-.4511-.1517-.5652-.1981-.1141-.4512-.0464-.5653.1517l-2.0305 3.5163c-1.5741-.7201-3.3281-1.1218-5.1881-1.1218-1.8599 0-3.6139.4006-5.1881 1.1217l-2.0305-3.5162c-.1141-.1981-.3672-.2658-.5652-.1517-.1981.1141-.2659.3672-.1517.5652l1.9972 3.4592c-3.6476 2.0485-6.1358 5.6744-6.4168 9.9445h19.3277c-.2809-4.2701-2.7691-7.896-6.4168-9.9445" />
    </svg>
  );
}

function Tile({
  icon,
  iconWrapClass,
  label,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  iconWrapClass: string;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg ${iconWrapClass}`}>
          {icon}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 mt-1" />
      </div>
      <p className="text-sm font-semibold text-white leading-snug">{label}</p>
    </>
  );

  const className =
    'block text-left bg-surface-card border border-border-subtle rounded-2xl p-4 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10 transition-all';

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${className} w-full`}>
      {inner}
    </button>
  );
}

function DownloadSheet({
  dict,
  onClose,
}: {
  dict: LandingTranslations;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={dict.hero.download_sheet.title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-sm bg-surface-card border-t sm:border border-border-subtle sm:rounded-2xl rounded-t-2xl p-6 pb-8 sm:pb-6"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">{dict.hero.download_sheet.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{dict.hero.download_sheet.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label={dict.hero.download_sheet.close}
            className="p-1.5 -mr-1.5 -mt-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all rounded-xl px-4 py-3"
          >
            <AppStoreIcon />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 leading-tight">Download on the</p>
              <p className="text-sm font-semibold text-white leading-tight">App Store</p>
            </div>
          </a>
          <a
            href={RUSTORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all rounded-xl px-4 py-3"
          >
            <AndroidIcon />
            <div className="text-left">
              <p className="text-[10px] text-gray-400 leading-tight">Get it on</p>
              <p className="text-sm font-semibold text-white leading-tight">Android</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export function ActionTiles({ dict, locale }: { dict: LandingTranslations; locale: string }) {
  const [downloadOpen, setDownloadOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
        <Tile
          icon={<WhatsAppIcon />}
          iconWrapClass="bg-[#25D366]"
          label={dict.hero.tiles.whatsapp}
          href={getWhatsAppUrl(locale)}
        />
        <Tile
          icon={<InstagramIcon />}
          iconWrapClass="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
          label={dict.hero.tiles.instagram}
          href={INSTAGRAM_URL}
        />
        <Tile
          icon={<DownloadIcon />}
          iconWrapClass="bg-brand"
          label={dict.hero.tiles.download_app}
          onClick={() => setDownloadOpen(true)}
        />
      </div>
      {downloadOpen && <DownloadSheet dict={dict} onClose={() => setDownloadOpen(false)} />}
    </>
  );
}
