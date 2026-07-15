import { AdminLayout } from '@/components/admin-layout';
import { prisma } from '@/lib/db';
import { ImportForm } from './import-form';

export const dynamic = 'force-dynamic';

export default async function ImportClientsPage() {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Импорт клиентов из CSV</h1>
      <ImportForm branches={branches} />
    </AdminLayout>
  );
}
