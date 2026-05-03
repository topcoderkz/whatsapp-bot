'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { LanguageSwitcher } from './language-switcher';
import type { LandingTranslations } from '@/i18n/types';
import { WHATSAPP_URL } from '@/lib/constants';

const NAV_SECTIONS = ['about', 'branches', 'pricing', 'trainers', 'classes', 'promotions', 'contact'] as const;

export function Navbar({ dict, locale }: { dict: LandingTranslations; locale: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled ? 'bg-surface-1/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href={`/${locale}`} className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-black text-white">
              100<span className="text-brand">%</span> FITNESS
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_SECTIONS.map((section) => (
              <a
                key={section}
                href={`#${section}`}
                className="text-sm text-gray-300 hover:text-brand transition-colors"
              >
                {dict.nav[section as keyof typeof dict.nav]}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} />
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 bg-brand text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-brand-hover transition-colors"
            >
              {dict.nav.whatsapp_cta}
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-gray-300"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-surface-1/98 backdrop-blur-md border-t border-border-subtle">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            {NAV_SECTIONS.map((section) => (
              <a
                key={section}
                href={`#${section}`}
                onClick={() => setMenuOpen(false)}
                className="text-gray-300 hover:text-brand py-2 transition-colors"
              >
                {dict.nav[section as keyof typeof dict.nav]}
              </a>
            ))}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-center bg-brand text-white font-bold py-3.5 rounded-full hover:bg-brand-hover transition-colors"
            >
              {dict.nav.whatsapp_cta}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
