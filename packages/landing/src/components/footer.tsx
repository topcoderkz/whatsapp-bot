import type { LandingTranslations } from '@/i18n/types';
import { WHATSAPP_URL, INSTAGRAM_URL, THREADS_URL } from '@/lib/constants';

const NAV_SECTIONS = ['about', 'branches', 'pricing', 'trainers', 'classes', 'contact'] as const;

export function Footer({ dict, locale }: { dict: LandingTranslations; locale: string }) {
  return (
    <footer className="bg-surface-1 border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <span className="text-xl font-black text-white">
              100<span className="text-brand">%</span> FITNESS
            </span>
            <p className="mt-3 text-sm text-gray-400">{dict.footer.description}</p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {dict.footer.nav_title}
            </h4>
            <nav className="flex flex-col gap-2">
              {NAV_SECTIONS.map((section) => (
                <a
                  key={section}
                  href={`#${section}`}
                  className="text-sm text-gray-400 hover:text-brand transition-colors"
                >
                  {dict.nav[section as keyof typeof dict.nav]}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {dict.footer.contact_title}
            </h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">
                WhatsApp: +7 708 640 6121
              </a>
              <span>Almaty, Kazakhstan</span>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              {dict.footer.social_title}
            </h4>
            <div className="flex gap-4">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition-colors" aria-label="Instagram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href={THREADS_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition-colors" aria-label="Threads">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.838-3.724 1.694-4.942-.1-.85-.418-1.55-.944-2.082a3.94 3.94 0 00-.414-.357 8.844 8.844 0 01-.475 2.038c-.555 1.494-1.483 2.602-2.762 3.293-1.211.655-2.647.92-4.265.786-1.947-.161-3.489-.888-4.459-2.102-.922-1.155-1.39-2.657-1.354-4.346.067-3.106 2.099-5.296 5.304-5.716a8.27 8.27 0 012.29.072c.73.121 1.418.337 2.042.64.008-.505-.015-1-.071-1.486l2.018-.242c.093.78.127 1.583.096 2.37a6.552 6.552 0 012.185 2.098c.737 1.09 1.165 2.431 1.272 3.988.178 2.592-.658 4.878-2.354 6.437C17.605 23.2 15.285 23.97 12.186 24zm-.09-14.394c-2.2.274-3.428 1.665-3.473 3.929-.024 1.166.293 2.132.916 2.912.66.827 1.665 1.3 2.91 1.403 1.225.101 2.27-.098 3.112-.594.896-.527 1.558-1.35 1.97-2.455.364-.977.536-2.134.488-3.283a4.837 4.837 0 00-2.005-1.11 6.507 6.507 0 00-3.918.198z"/></svg>
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition-colors" aria-label="WhatsApp">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border-subtle text-center text-sm text-gray-500">
          {dict.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
