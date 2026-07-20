import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, isValidLocale } from '@/i18n';
import { getTrainerById } from '@/lib/data';
import { getWhatsAppUrl } from '@/lib/constants';
import { ClassCard } from '@/components/class-card';
import { ContactCta } from '@/components/contact-cta';
import { SectionWrapper } from '@/components/section-wrapper';
import { PhotoCarousel } from '@/components/photo-carousel';

// Turn a KZ/RU phone into a plain digit-only string suitable for wa.me.
// "+7 705 629 2233" / "8 705 629 2233" / "77056292233" → "77056292233".
function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D+/g, '');
  if (!digits) return null;
  // "8XXXXXXXXXX" (KZ/RU local) → "7XXXXXXXXXX"
  if (digits.length === 11 && digits.startsWith('8')) return '7' + digits.slice(1);
  return digits;
}

export const dynamic = 'force-dynamic';

export default async function TrainerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const validLocale = isValidLocale(locale) ? locale : 'ru';
  const dict = getDictionary(validLocale);

  const trainerId = Number(id);
  if (!Number.isFinite(trainerId) || trainerId <= 0) notFound();

  const trainer = await getTrainerById(trainerId);
  if (!trainer) notFound();

  const t = trainer as any;
  const branch = t.branch as { id: number; name: string; slug: string };
  const groupClasses: any[] = t.groupClasses ?? [];
  const photos: { id: number; imageUrl: string }[] = t.photos ?? [];

  // If a trainer has photos, feed them to the carousel. Otherwise fall back
  // to the single photoUrl (rendered as a one-slide carousel) or the empty
  // avatar. This keeps existing trainers without extra photos working.
  const carouselPhotos =
    photos.length > 0
      ? photos.map((p) => ({ id: p.id, imageUrl: p.imageUrl }))
      : t.photoUrl
        ? [{ id: 'main' as unknown as number, imageUrl: t.photoUrl }]
        : [];

  const trainerWa = t.phone ? normalizePhone(t.phone) : null;

  return (
    <main>
      {/* Hero */}
      <section className="relative pt-20 pb-8 md:pt-28 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-1 via-surface-1 to-brand/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,107,0,0.12),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${validLocale}/trainers`}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {dict.trainer_page.back_to_all}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Photo — top on mobile, right on desktop */}
            <div className="order-1 lg:order-2">
              {carouselPhotos.length > 0 ? (
                <div className="max-w-md mx-auto">
                  <PhotoCarousel
                    photos={carouselPhotos}
                    branchName={t.name}
                    aspect="3/4"
                    objectFit="contain"
                  />
                </div>
              ) : (
                <div className="relative aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden border border-border-subtle bg-surface-2">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-2 to-surface-card">
                    <svg className="w-32 h-32 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Info — second on mobile, left on desktop */}
            <div className="order-2 lg:order-1">
              <Link
                href={`/${validLocale}/branch/${branch.slug}`}
                className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand text-sm font-medium px-4 py-2 rounded-full mb-6 hover:bg-brand/15 transition-colors"
              >
                <span className="text-base">📍</span>
                {branch.name}
              </Link>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                {t.name}
              </h1>

              {t.specialization && (
                <p className="mt-4 text-lg text-gray-300">
                  <span className="text-brand mr-2">🎯</span>
                  {t.specialization}
                </p>
              )}

              {t.experienceYears && (
                <div className="mt-4 inline-flex items-center gap-1.5 bg-brand/10 text-brand text-sm font-bold px-3 py-1.5 rounded-full">
                  {dict.trainer_page.experience_label}: {t.experienceYears} {dict.trainers.years}
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <a
                  href={trainerWa ? `https://wa.me/${trainerWa}` : getWhatsAppUrl(validLocale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-brand text-white font-bold px-6 py-3.5 rounded-full hover:bg-brand-hover transition-all shadow-lg shadow-brand/25"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {trainerWa ? dict.trainer_page.whatsapp_direct : dict.nav.whatsapp_cta}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio */}
      {t.bio && (
        <SectionWrapper id="trainer-bio" alternate>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-6 text-center">
              {dict.trainer_page.bio_title}
            </h2>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-line">
              {t.bio}
            </p>
          </div>
        </SectionWrapper>
      )}

      {/* Group classes */}
      {groupClasses.length > 0 && (
        <SectionWrapper id="trainer-classes">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">
              {dict.trainer_page.classes_title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupClasses.map((gc) => (
              <ClassCard
                key={gc.id}
                groupClass={{ ...gc, branch: { name: branch.name } }}
                dict={dict}
              />
            ))}
          </div>
        </SectionWrapper>
      )}

      <ContactCta branches={[branch as any]} dict={dict} locale={validLocale} />
    </main>
  );
}
