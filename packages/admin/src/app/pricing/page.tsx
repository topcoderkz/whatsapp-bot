import { AdminLayout } from '@/components/admin-layout';
import { prisma } from '@/lib/db';
import { PricingMatrix } from './pricing-matrix';

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const branches = await prisma.branch.findMany({ where: { isActive: true }, orderBy: { id: 'asc' } });
  const memberships = await prisma.membership.findMany({
    orderBy: [{ displayOrder: 'asc' }, { branchId: 'asc' }],
    include: { branch: true },
  });

  // Group by type for matrix view
  const monthlyTypes = ['VISITS_12_MORNING', 'VISITS_12_FULL', 'UNLIMITED_MORNING', 'UNLIMITED_FULL'];
  const longtermTypes = ['MONTHS_3', 'MONTHS_6', 'MONTHS_12'];

  const monthly = memberships.filter(m => monthlyTypes.includes(m.type));
  const longterm = memberships.filter(m => longtermTypes.includes(m.type));

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Цены</h1>
      <p className="text-sm text-gray-500 mb-6">Нажмите на цену, чтобы изменить. Изменения сохраняются автоматически.</p>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Абонементы на 1 месяц</h2>
          <PricingMatrix branches={branches} memberships={monthly} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Долгосрочные абонементы</h2>
          <PricingMatrix branches={branches} memberships={longterm} />
        </div>
      </div>
    </AdminLayout>
  );
}
