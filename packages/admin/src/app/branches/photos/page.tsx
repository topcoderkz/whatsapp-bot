import { AdminLayout } from '@/components/admin-layout';
import { prisma } from '@/lib/db';
import { BranchPhotoManager } from './branch-photo-manager';

export const dynamic = 'force-dynamic';

export default async function BranchPhotosPage() {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    include: { photos: { orderBy: { displayOrder: 'asc' } } },
    orderBy: { id: 'asc' },
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Фото филиалов</h1>
        <p className="text-sm text-gray-500 mt-1">
          Загрузите фотографии для каждого филиала. Первое фото будет основным на сайте.
        </p>
      </div>
      <div className="space-y-6">
        {branches.map((branch) => (
          <BranchPhotoManager
            key={branch.id}
            branch={{
              id: branch.id,
              name: branch.name,
              photos: branch.photos.map((p) => ({
                id: p.id,
                imageUrl: p.imageUrl,
                displayOrder: p.displayOrder,
              })),
            }}
          />
        ))}
      </div>
    </AdminLayout>
  );
}
