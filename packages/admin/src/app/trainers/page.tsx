import { AdminLayout } from '@/components/admin-layout';
import { ImageUpload } from '@/components/image-upload';
import { prisma } from '@/lib/db';
import { createTrainer } from '@/lib/actions';
import { TrainerCard } from './trainer-card';

export const dynamic = 'force-dynamic';

export default async function TrainersPage() {
  const trainers = await prisma.trainer.findMany({
    include: { branch: true },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  });
  const branches = await prisma.branch.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Тренеры</h1>

      {/* Add trainer form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Добавить тренера</h2>
        <form action={createTrainer} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Филиал</label>
              <select name="branchId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Выберите филиал</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Имя</label>
              <input name="name" placeholder="Имя тренера" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Специализация</label>
              <input name="specialization" placeholder="Фитнес, йога, бокс..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Опыт (лет)</label>
              <input name="experienceYears" type="number" placeholder="5" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">О тренере</label>
              <input name="bio" placeholder="Краткое описание" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Фото</label>
            <ImageUpload name="photoUrl" />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Добавить
          </button>
        </form>
      </div>

      {/* Trainer list */}
      <div className="space-y-4">
        {trainers.map((t) => (
          <TrainerCard key={t.id} trainer={t as any} branches={branches} />
        ))}
        {trainers.length === 0 && (
          <p className="text-center py-8 text-sm text-gray-500">Тренеров пока нет. Добавьте первого тренера выше.</p>
        )}
      </div>
    </AdminLayout>
  );
}
