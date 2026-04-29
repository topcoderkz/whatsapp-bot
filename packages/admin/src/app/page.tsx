import { AdminLayout } from '@/components/admin-layout';
import { StatsCard } from '@/components/stats-card';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalClients, activeClients, todayBookings, pendingBookings, activePromos] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { isActive: true } }),
    prisma.booking.count({ where: { createdAt: { gte: today } } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.promotion.count({ where: { isActive: true } }),
  ]);

  const recentBookings = await prisma.booking.findMany({
    where: { status: 'PENDING' },
    include: { branch: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Панель управления</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Клиентов" value={activeClients} icon="👤" />
        <StatsCard title="Записей сегодня" value={todayBookings} icon="📅" />
        <StatsCard title="Ожидают подтверждения" value={pendingBookings} icon="⏳" accent={pendingBookings > 0} />
        <StatsCard title="Активных акций" value={activePromos} icon="🎁" />
      </div>

      {pendingBookings > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-amber-800 mb-4">
            Записи, ожидающие подтверждения ({pendingBookings})
          </h2>
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-lg px-4 py-3 border border-amber-100 gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{b.clientPhone}</p>
                  <p className="text-xs text-gray-500">
                    {b.branch.name} &bull; {new Date(b.date).toLocaleDateString('ru-RU')} &bull; {b.timeSlot} &bull; {b.workoutType === 'INDIVIDUAL' ? 'Индивидуальная' : 'Групповая'}
                  </p>
                </div>
                <Link
                  href="/bookings"
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  Управление
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h2>
          <div className="space-y-2">
            <Link href="/pricing" className="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors">
              💰 Изменить цены
            </Link>
            <Link href="/promotions" className="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors">
              🎁 Создать акцию
            </Link>
            <Link href="/clients/import" className="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors">
              📥 Импорт клиентов из CSV
            </Link>
            <Link href="/broadcasts/new" className="block px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors">
              📨 Новая рассылка
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
