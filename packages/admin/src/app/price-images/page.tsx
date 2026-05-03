import { AdminLayout } from '@/components/admin-layout';
import { prisma } from '@/lib/db';
import { PriceImageCard } from './price-image-card';

export const dynamic = 'force-dynamic';

export default async function PriceImagesPage() {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
    include: { priceImage: true },
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Прайс-изображения</h1>
        <p className="text-sm text-gray-500 mt-1">
          Загрузите изображения прайс-листов для каждого филиала. Эти изображения будут отправляться в WhatsApp когда клиент запрашивает цены.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch) => (
          <PriceImageCard key={branch.id} branch={branch} />
        ))}
      </div>
    </AdminLayout>
  );
}
