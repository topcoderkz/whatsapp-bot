import { AdminLayout } from '@/components/admin-layout';
import { prisma } from '@/lib/db';
import { BroadcastNewForm } from './broadcast-new-form';

export const dynamic = 'force-dynamic';

export default async function NewBroadcastPage() {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Новая рассылка</h1>
      <BroadcastNewForm branches={branches} />
    </AdminLayout>
  );
}
