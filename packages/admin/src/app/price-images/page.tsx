import { AdminLayout } from '@/components/admin-layout';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getBranchesWithPriceImages() {
  // Get branches first (always works)
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
  });

  // Try to get price images separately
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
  const { branches, hasPriceImages } = await getBranchesWithPriceImages();

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Прайс-изображения</h1>
        <p className="text-sm text-gray-500 mt-1">
          Загрузите изображения прайс-листов для каждого филиала. Эти изображения будут отправляться в WhatsApp когда клиент запрашивает цены.
        </p>
        {!hasPriceImages && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Миграция базы данных еще не применена. После следующего деплоя эта функция будет полностью доступна.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch: any) => (
          <div key={branch.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900">{branch.name}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {branch.priceImage?.imageUrl
                ? 'Изображение загружено'
                : 'Изображение не загружено'}
            </p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
