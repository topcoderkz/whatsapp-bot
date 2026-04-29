import { clearSessionCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function LogoutPage() {
  const session = await getSession();
  if (session) {
    await clearSessionCookie();
  }
  redirect('/login');
}
