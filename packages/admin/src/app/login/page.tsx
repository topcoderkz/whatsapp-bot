import { redirect } from 'next/navigation';
import { login, setSessionCookie, getSession } from '@/lib/auth';

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/');

  async function handleLogin(formData: FormData) {
    'use server';
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const token = await login(username, password);
    if (token) {
      await setSessionCookie(token);
      redirect('/');
    }
    // If login fails, redirect back to login with error
    redirect('/login?error=1');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">100% Fitness</h1>
            <p className="text-sm text-gray-500 mt-1">Вход в панель управления</p>
          </div>

          <form action={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Логин
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="admin"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
