import { SectionWrapper } from './section-wrapper';
import { BranchCard } from './branch-card';
import type { LandingTranslations } from '@/i18n/types';

type Branch = {
  id: number;
  name: string;
  address: string;
  phone: string;
  workingHours: string;
  photos: Array<{ id: number; imageUrl: string; displayOrder: number }>;
};

export function Branches({ branches, dict }: { branches: Branch[]; dict: LandingTranslations }) {
  return (
    <SectionWrapper id="branches">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">
          {dict.branches.title}
        </h2>
        <p className="mt-4 text-lg text-gray-400">{dict.branches.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((branch) => (
          <BranchCard key={branch.id} branch={branch} dict={dict} />
        ))}
      </div>
    </SectionWrapper>
  );
}
