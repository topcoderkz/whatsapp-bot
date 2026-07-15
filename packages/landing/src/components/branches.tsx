import { SectionWrapper } from './section-wrapper';
import { BranchCard } from './branch-card';
import { HorizontalCarousel } from './horizontal-carousel';
import type { LandingTranslations } from '@/i18n/types';

type Branch = {
  id: number;
  slug: string;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  photos: Array<{ id: number; imageUrl: string; displayOrder: number }>;
};

export function Branches({ branches, dict, locale }: { branches: Branch[]; dict: LandingTranslations; locale: string }) {
  return (
    <SectionWrapper id="branches">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">
          {dict.branches.title}
        </h2>
        <p className="mt-3 text-base md:text-lg text-gray-400">{dict.branches.subtitle}</p>
      </div>

      <HorizontalCarousel dotAriaLabel={dict.branches.title}>
        {branches.map((branch) => (
          <BranchCard key={branch.id} branch={branch} dict={dict} locale={locale} />
        ))}
      </HorizontalCarousel>
    </SectionWrapper>
  );
}
