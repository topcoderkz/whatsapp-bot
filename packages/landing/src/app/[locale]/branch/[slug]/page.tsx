import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, isValidLocale } from '@/i18n';
import { getBranchBySlug } from '@/lib/data';
import { BRANCH_FALLBACK_IMAGES, getMapUrl } from '@/lib/branch-meta';
import { getWhatsAppUrl } from '@/lib/constants';
import { BranchGallery } from '@/components/branch-gallery';
import { PhotoCarousel } from '@/components/photo-carousel';
import { PricingTable } from '@/components/pricing-table';
import { TrainerCard } from '@/components/trainer-card';
import { ClassCard } from '@/components/class-card';
import { ContactCta } from '@/components/contact-cta';
import { SectionWrapper } from '@/components/section-wrapper';

// SSR per request — DB isn't reachable from the landing Docker build
// (no Cloud SQL Auth Proxy in that step), so we can't pre-render here.
// The underlying Prisma queries are wrapped in unstable_cache (revalidate: 300)
// so the per-request cost is amortized across 5 min windows.
export const dynamic = 'force-dynamic';

export default async function BranchPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const validLocale = isValidLocale(locale) ? locale : 'ru';
  const dict = getDictionary(validLocale);

  const branch = await getBranchBySlug(slug);
  if (!branch) notFound();

  const b = branch as any;
  const photos: any[] = b.photos ?? [];
  const memberships: any[] = b.memberships ?? [];
  const trainers: any[] = b.trainers ?? [];
  const groupClasses: any[] = b.groupClasses ?? [];

  const mapUrl = getMapUrl(branch.address);
  const heroImage = photos[0]?.imageUrl || BRANCH_FALLBACK_IMAGES[branch.address];

  return (
    <main>
      {/* Hero */}
      <section className="relative pt-24 pb-12 md:pt-28 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-1 via-surface-1 to-brand/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,107,0,0.12),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href={`/${validLocale}#branches`}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {dict.branch_page.back_to_all}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image side — first on mobile, right on desktop */}
            <div className="order-1 lg:order-2">
              {/* Mobile: swipeable carousel with dot indicator */}
              <div className="md:hidden">
                <PhotoCarousel
                  photos={photos}
                  branchName={branch.name}
                  fallback={BRANCH_FALLBACK_IMAGES[branch.address]}
                />
              </div>
              {/* Desktop: single hero image */}
              <div className="hidden md:block relative aspect-[4/3] rounded-2xl overflow-hidden border border-border-subtle">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={branch.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand/10 via-surface-2 to-surface-card flex items-center justify-center">
                    <svg className="w-16 h-16 text-brand/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Text side — second on mobile, left on desktop */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand text-sm font-medium px-4 py-2 rounded-full mb-6">
                <span className="text-base">📍</span>
                100% Fitness Gym
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                {branch.name}
              </h1>

              <p className="mt-4 text-lg text-gray-300">
                {branch.address}
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-base">
                  <span className="text-gray-500 w-24 shrink-0">{dict.branches.hours}:</span>
                  <span className="text-gray-200">{branch.workingHours}</span>
                </div>
                <div className="flex items-center gap-3 text-base">
                  <span className="text-gray-500 w-24 shrink-0">{dict.branches.phone}:</span>
                  <a href={`tel:${branch.phone}`} className="text-gray-200 hover:text-brand transition-colors">
                    {branch.phone}
                  </a>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href={getWhatsAppUrl(validLocale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-brand text-white font-bold px-6 py-3.5 rounded-full hover:bg-brand-hover transition-all shadow-lg shadow-brand/25"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {dict.nav.whatsapp_cta}
                </a>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-border-subtle text-gray-200 font-bold px-6 py-3.5 rounded-full hover:border-brand/50 hover:text-white transition-colors"
                >
                  {dict.branches.view_map} — 2GIS
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photos gallery — desktop only (mobile shows the carousel in the hero). */}
      {photos.length > 0 && (
        <div className="hidden md:block">
          <SectionWrapper id="branch-photos" alternate>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">
                {dict.branch_page.photos_title}
              </h2>
            </div>
            <div className="max-w-3xl mx-auto">
              <BranchGallery photos={photos} branchName={branch.name} dict={dict} />
            </div>
          </SectionWrapper>
        </div>
      )}

      {/* Pricing */}
      <SectionWrapper id="branch-pricing">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">
            {dict.branch_page.pricing_title}
          </h2>
        </div>
        <div className="max-w-4xl mx-auto bg-surface-card border border-border-subtle rounded-2xl overflow-hidden">
          <PricingTable memberships={memberships} dict={dict} />
        </div>
        <div className="mt-8 text-center">
          <a
            href={getWhatsAppUrl(validLocale)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-brand text-white font-bold px-8 py-4 rounded-full hover:bg-brand-hover transition-colors"
          >
            {dict.pricing.contact_cta}
          </a>
        </div>
      </SectionWrapper>

      {/* Trainers */}
      <SectionWrapper id="branch-trainers" alternate>
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">
            {dict.branch_page.trainers_title}
          </h2>
        </div>
        {trainers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👨‍🏫</div>
            <p className="text-gray-400 text-lg">{dict.branch_page.no_trainers}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trainers.map((trainer: any) => (
              <TrainerCard
                key={trainer.id}
                trainer={{ ...trainer, branch: { id: branch.id, name: branch.name } }}
                dict={dict}
                locale={validLocale}
              />
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* Group classes */}
      <SectionWrapper id="branch-classes">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">
            {dict.branch_page.classes_title}
          </h2>
        </div>
        {groupClasses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-gray-400 text-lg">{dict.branch_page.no_classes}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupClasses.map((gc: any) => (
              <ClassCard
                key={gc.id}
                groupClass={{ ...gc, branch: { name: branch.name } }}
                dict={dict}
              />
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* Contact CTA — reuse existing component with single branch */}
      <ContactCta branches={[branch]} dict={dict} locale={validLocale} />
    </main>
  );
}
