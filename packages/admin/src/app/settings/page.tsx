import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin-layout';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  async function changePassword(formData: FormData) {
    'use server';

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      redirect('/settings?error=empty');
    }

    if (newPassword !== confirmPassword) {
      redirect('/settings?error=mismatch');
    }

    if (newPassword.length < 6) {
      redirect('/settings?error=short');
    }

    const user = await prisma.adminUser.findUnique({ where: { id: session!.userId } });
    if (!user) redirect('/login');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      redirect('/settings?error=wrong');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({
      where: { id: session!.userId },
      data: { passwordHash: newHash },
    });

    redirect('/settings?success=1');
  }

  return (
    <AdminLayout>
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Настройки</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Сменить пароль</h2>

        <form action={changePassword} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Текущий пароль
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Новый пароль
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Подтвердите новый пароль
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            Сменить пароль
          </button>
        </form>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Аккаунт</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Логин:</span> {session!.username}</p>
          <p><span className="font-medium">Роль:</span> {session!.role === 'SUPER_ADMIN' ? 'Супер-админ' : 'Менеджер филиала'}</p>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}
