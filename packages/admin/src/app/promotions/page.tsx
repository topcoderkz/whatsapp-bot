import { AdminLayout } from '@/components/admin-layout';
import { ImageUpload } from '@/components/image-upload';
import { prisma } from '@/lib/db';
import { createPromotion, togglePromotion, updatePromotionBranches } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function PromotionsPage() {
  const now = new Date();
  const [promos, branches] = await Promise.all([
    prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
      include: { branches: { select: { id: true, name: true } } },
    }),
    prisma.branch.findMany({ where: { isActive: true }, orderBy: { id: 'asc' }, select: { id: true, name: true } }),
  ]);

  const active = promos.filter(p => p.isActive && p.endDate >= now && p.startDate <= now);
  const scheduled = promos.filter(p => p.isActive && p.startDate > now);
  const expired = promos.filter(p => !p.isActive || p.endDate < now);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Акции и предложения</h1>

      {/* Create promotion */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Создать акцию</h2>
        <form action={createPromotion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Заголовок</label>
              <input name="title" placeholder="Название акции" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Изображение</label>
              <ImageUpload name="imageUrl" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Описание</label>
            <textarea name="description" placeholder="Описание акции" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Условия</label>
            <input name="conditions" placeholder="Условия участия" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Дата начала</label>
              <input name="startDate" type="date" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Дата окончания</label>
              <input name="endDate" type="date" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Филиалы (если ничего не выбрано — применяется ко всем)</label>
            <div className="flex flex-wrap gap-3">
              {branches.map(b => (
                <label key={b.id} className="text-sm text-gray-700 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" name="branchIds" value={b.id} className="rounded" />
                  {b.name}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Создать
          </button>
        </form>
      </div>

      {/* Promo sections */}
      {[
        { title: 'Активные', items: active },
        { title: 'Запланированные', items: scheduled },
        { title: 'Завершённые', items: expired },
      ].map(({ title, items }) => (
        <div key={title} className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{title} ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-sm text-gray-400">Нет акций</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(p => (
                <div key={p.id} className={`bg-white rounded-xl border border-gray-200 p-4 ${!p.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{p.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{p.description.slice(0, 100)}{p.description.length > 100 ? '...' : ''}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(p.startDate).toLocaleDateString('ru-RU')} — {new Date(p.endDate).toLocaleDateString('ru-RU')}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {p.branches.length === 0 ? (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            Все филиалы
                          </span>
                        ) : (
                          p.branches.map(b => (
                            <span key={b.id} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              📍 {b.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <form action={togglePromotion.bind(null, p.id, !p.isActive)}>
                      <button type="submit" className={`text-xs font-medium px-3 py-1.5 rounded ${p.isActive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {p.isActive ? 'Деактивировать' : 'Активировать'}
                      </button>
                    </form>
                  </div>

                  <details className="mt-3 border-t border-gray-100 pt-3">
                    <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 select-none">
                      Изменить филиалы
                    </summary>
                    <form action={updatePromotionBranches.bind(null, p.id)} className="mt-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {branches.map(b => (
                          <label key={b.id} className="text-xs text-gray-700 inline-flex items-center gap-1.5 px-2 py-1 rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              name="branchIds"
                              value={b.id}
                              defaultChecked={p.branches.some(pb => pb.id === b.id)}
                              className="rounded"
                            />
                            {b.name}
                          </label>
                        ))}
                      </div>
                      <button type="submit" className="text-xs font-medium px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">
                        Сохранить
                      </button>
                    </form>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </AdminLayout>
  );
}
