import { AdminLayout } from '@/components/admin-layout';
import { WorkingHoursInput } from '@/components/working-hours-input';
import { prisma } from '@/lib/db';
import { updateBranch, toggleBranch } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function BranchesPage() {
  const branches = await prisma.branch.findMany({ orderBy: { id: 'asc' } });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Филиалы</h1>

      <div className="space-y-4">
        {branches.map((branch) => (
          <div key={branch.id} className={`bg-white rounded-xl border p-6 ${!branch.isActive ? 'opacity-60' : ''} border-gray-200`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {branch.name}
                {!branch.isActive && <span className="ml-2 text-xs text-red-500 font-normal">(неактивен)</span>}
              </h2>
              <form action={toggleBranch.bind(null, branch.id, !branch.isActive)}>
                <button type="submit" className={`px-3 py-1.5 rounded text-xs font-medium ${branch.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                  {branch.isActive ? 'Деактивировать' : 'Активировать'}
                </button>
              </form>
            </div>
            <form action={updateBranch.bind(null, branch.id)} className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                  <input name="name" defaultValue={branch.name} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                  <input name="address" defaultValue={branch.address} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input name="phone" defaultValue={branch.phone} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон менеджера</label>
                  <input name="managerPhone" defaultValue={branch.managerPhone} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <WorkingHoursInput name="workingHours" defaultValue={branch.workingHours} />
              </div>

              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                Сохранить
              </button>
            </form>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
