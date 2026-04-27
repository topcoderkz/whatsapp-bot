import { AdminLayout } from '@/components/admin-layout';
import { ImageUpload } from '@/components/image-upload';
import { prisma } from '@/lib/db';
import { createPromotion, togglePromotion } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function PromotionsPage() {
  const now = new Date();
  const promos = await prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });

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
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Создать
          </button>
        </form>
      </div>

      {/* Promo sections */}
      {[
        { title: 'Активные', items: active, color: 'green' },
        { title: 'Запланированные', items: scheduled, color: 'blue' },
        { title: 'Завершённые', items: expired, color: 'gray' },
      ].map(({ title, items, color }) => (
        <div key={title} className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{title} ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-sm text-gray-400">Нет акций</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(p => (
                <div key={p.id} className={`bg-white rounded-xl border border-gray-200 p-4 ${!p.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{p.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{p.description.slice(0, 100)}{p.description.length > 100 ? '...' : ''}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(p.startDate).toLocaleDateString('ru-RU')} — {new Date(p.endDate).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <form action={togglePromotion.bind(null, p.id, !p.isActive)}>
                      <button type="submit" className={`text-xs font-medium px-3 py-1.5 rounded ${p.isActive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {p.isActive ? 'Деактивировать' : 'Активировать'}
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </AdminLayout>
  );
}
