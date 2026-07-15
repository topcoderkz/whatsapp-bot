import { getDictionary, isValidLocale } from '@/i18n';
import { getBranches, getTrainers } from '@/lib/data';
import { TrainerCard } from '@/components/trainer-card';
import { ContactCta } from '@/components/contact-cta';
import { HorizontalCarousel } from '@/components/horizontal-carousel';

export const dynamic = 'force-dynamic';

export default async function TrainersIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? locale : 'ru';
  const dict = getDictionary(validLocale);

  const [trainers, branches] = await Promise.all([getTrainers(), getBranches()]);

  // Group trainers by their branch (branches are already sorted by id, trainers by branchId+name).
  const groups = branches
    .map((b: any) => ({
      branch: b,
      list: (trainers as any[]).filter((t) => t.branch?.id === b.id),
    }))
    .filter((g) => g.list.length > 0);

  return (
    <main>
      {/* Hero / page header */}
      <section className="relative pt-24 pb-8 md:pt-28 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-1 via-surface-1 to-brand/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,107,0,0.12),transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
            {dict.trainers.title}
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            {dict.trainers.subtitle}
          </p>
        </div>
      </section>

      {/* Trainers grouped by branch */}
      <section className="py-12 md:py-16 bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {groups.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">👨‍🏫</div>
              <p className="text-gray-400 text-lg">{dict.trainers.placeholder}</p>
            </div>
          ) : (
            <div className="space-y-12 md:space-y-16">
              {groups.map(({ branch, list }) => (
                <div key={branch.id}>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="text-brand">📍</span>
                    {branch.name}
                  </h2>
                  <HorizontalCarousel
                    dotAriaLabel={branch.name}
                    itemClassName="w-[70%] sm:w-[45%] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]"
                  >
                    {list.map((trainer) => (
                      <TrainerCard key={trainer.id} trainer={trainer} dict={dict} locale={validLocale} />
                    ))}
                  </HorizontalCarousel>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <ContactCta branches={branches} dict={dict} locale={validLocale} />
    </main>
  );
}
