import { AdminLayout } from '@/components/admin-layout';
import { ScheduleEditor } from '@/components/schedule-editor';
import { prisma } from '@/lib/db';
import { createGroupClass } from '@/lib/actions';
import { ClassCard } from './class-card';

export const dynamic = 'force-dynamic';

export default async function ClassesPage() {
  const classes = await prisma.groupClass.findMany({
    include: { branch: true, trainer: true },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  });
  const branches = await prisma.branch.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  const trainers = await prisma.trainer.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Групповые занятия</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Добавить занятие</h2>
        <form action={createGroupClass} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Филиал</label>
              <select name="branchId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Выберите филиал</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Название</label>
              <input name="name" placeholder="Йога, Пилатес..." required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Тренер (необязательно)</label>
              <select name="trainerId" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Не выбран</option>
                {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Мест</label>
              <input name="capacity" type="number" placeholder="20" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Описание</label>
              <input name="description" placeholder="Краткое описание занятия" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <ScheduleEditor name="schedule" />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Добавить
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {classes.map((c) => (
          <ClassCard
            key={c.id}
            groupClass={{ ...c, schedule: c.schedule as Record<string, string> }}
            trainers={trainers}
          />
        ))}
        {classes.length === 0 && (
          <p className="text-center py-8 text-sm text-gray-500">Занятий пока нет.</p>
        )}
      </div>
    </AdminLayout>
  );
}
