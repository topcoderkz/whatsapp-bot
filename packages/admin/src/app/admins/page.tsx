import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { AdminCard } from './admin-card';

export default async function AdminsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'SUPER_ADMIN') redirect('/');

  const [admins, branches] = await Promise.all([
    prisma.adminUser.findMany({
      orderBy: { id: 'asc' },
      include: { branch: { select: { name: true } } },
    }),
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  async function createAdmin(formData: FormData) {
    'use server';

    const username = (formData.get('username') as string)?.trim();
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const branchId = formData.get('branchId') as string;

    if (!username || !password || password.length < 6) return redirect('/admins?error=invalid');

    const existing = await prisma.adminUser.findUnique({ where: { username } });
    if (existing) return redirect('/admins?error=exists');

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.adminUser.create({
      data: {
        username,
        passwordHash,
        role: role as 'SUPER_ADMIN' | 'BRANCH_MANAGER',
        branchId: branchId ? parseInt(branchId) : null,
      },
    });

    redirect('/admins');
  }

  async function deleteAdmin(formData: FormData) {
    'use server';

    const id = parseInt(formData.get('id') as string);
    if (!session || id === session.userId) return redirect('/admins?error=self');

    await prisma.adminUser.delete({ where: { id } });
    redirect('/admins');
  }

  async function updateAdmin(formData: FormData) {
    'use server';

    const id = parseInt(formData.get('id') as string);
    const role = formData.get('role') as string;
    const branchId = formData.get('branchId') as string;
    const newPassword = (formData.get('newPassword') as string)?.trim();

    const data: Record<string, unknown> = {
      role: role as 'SUPER_ADMIN' | 'BRANCH_MANAGER',
      branchId: branchId ? parseInt(branchId) : null,
    };

    if (newPassword && newPassword.length >= 6) {
      data.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await prisma.adminUser.update({ where: { id }, data });
    redirect('/admins');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Администраторы</h1>
      </div>

      {/* Add new admin form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Добавить администратора</h2>
        <form action={createAdmin} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
            <input
              name="username"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
            <select
              name="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="BRANCH_MANAGER">Менеджер филиала</option>
              <option value="SUPER_ADMIN">Супер-админ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Филиал</label>
            <select
              name="branchId"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">— Не назначен —</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Добавить
          </button>
        </form>
      </div>

      {/* Admin list */}
      <div className="space-y-3">
        {admins.map((admin) => (
          <AdminCard
            key={admin.id}
            admin={{
              id: admin.id,
              username: admin.username,
              role: admin.role,
              branchId: admin.branchId,
              branchName: admin.branch?.name ?? null,
            }}
            branches={branches}
            isSelf={admin.id === session.userId}
            updateAction={updateAdmin}
            deleteAction={deleteAdmin}
          />
        ))}
      </div>
    </div>
  );
}
