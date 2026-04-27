import { AdminLayout } from '@/components/admin-layout';
import { prisma } from '@/lib/db';
import { createClient, toggleClient } from '@/lib/actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string; branch?: string }> }) {
  const params = await searchParams;
  const where: any = {};

  if (params.q) {
    where.OR = [
      { phone: { contains: params.q } },
      { name: { contains: params.q, mode: 'insensitive' } },
    ];
  }

  if (params.branch) {
    where.branchId = parseInt(params.branch, 10);
  }

  const clients = await prisma.client.findMany({
    where,
    include: { branch: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const branches = await prisma.branch.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  const totalCount = await prisma.client.count();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Клиенты ({totalCount})</h1>
        <Link href="/clients/import" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
          📥 Импорт CSV
        </Link>
      </div>

      {/* Search and filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <form className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Поиск по телефону или имени</label>
            <input name="q" defaultValue={params.q} placeholder="Телефон или имя..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Филиал</label>
            <select name="branch" defaultValue={params.branch} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Все</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Найти
          </button>
        </form>
      </div>

      {/* Add client */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Добавить клиента</h2>
        <form action={createClient} className="flex gap-4 items-end">
          <input name="phone" placeholder="+77001234567" required className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input name="name" placeholder="Имя (необязательно)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <select name="branchId" className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Филиал</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Добавить
          </button>
        </form>
      </div>

      {/* Client table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Телефон</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Имя</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Филиал</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Источник</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Статус</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className={`border-b border-gray-100 last:border-0 ${!c.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.phone}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.name || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.branch?.name || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{c.source}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={toggleClient.bind(null, c.id, !c.isActive)} className="inline">
                    <button type="submit" className={`text-xs font-medium px-3 py-1.5 rounded ${c.isActive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {c.isActive ? 'Деактивировать' : 'Активировать'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <p className="text-center py-8 text-sm text-gray-500">Клиентов не найдено.</p>
        )}
      </div>
    </AdminLayout>
  );
}
