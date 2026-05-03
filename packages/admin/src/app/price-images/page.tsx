import { AdminLayout } from '@/components/admin-layout';
import { prisma } from '@/lib/db';
import { PriceImageCard } from './price-image-card';

export const dynamic = 'force-dynamic';

async function getBranchesWithPriceImages() {
  // Get branches first (always works)
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
  });

  // Get price images separately
  let priceImages: any[] = [];
  try {
    priceImages = await (prisma as any).priceImage.findMany();
  } catch {
    // Table doesn't exist yet (migration not applied)
    console.log('price_images table not found yet');
  }

  // Merge data
  const branchesWithImages = branches.map((branch: any) => {
    const priceImage = priceImages.find((pi: any) => pi.branchId === branch.id);
    return { ...branch, priceImage: priceImage || null };
  });

  return { branches: branchesWithImages, hasPriceImages: priceImages.length > 0 };
}

export default async function PriceImagesPage() {
  const { branches } = await getBranchesWithPriceImages();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Прайс-изображения</h1>
        <p className="text-sm text-gray-500 mt-1">
          Загрузите изображения прайс-листов для каждого филиала. Эти изображения будут отправляться в WhatsApp когда клиент запрашивает цены.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch: any) => (
          <PriceImageCard key={branch.id} branch={branch} />
        ))}
      </div>
    </AdminLayout>
  );
}
