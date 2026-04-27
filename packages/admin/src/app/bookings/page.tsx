import { AdminLayout } from '@/components/admin-layout';
import { prisma } from '@/lib/db';
import { BookingActions } from './booking-actions';

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: { branch: true, trainer: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const statusLabels: Record<string, string> = {
    PENDING: 'Ожидает',
    CONFIRMED: 'Подтверждена',
    CANCELLED: 'Отменена',
    COMPLETED: 'Завершена',
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Записи на тренировку</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Телефон</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Филиал</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Тип</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Дата</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Время</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Статус</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{b.clientPhone}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{b.branch.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{b.workoutType === 'INDIVIDUAL' ? 'Индивидуальная' : 'Групповая'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{new Date(b.date).toLocaleDateString('ru-RU')}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{b.timeSlot}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status]}`}>
                    {statusLabels[b.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {b.status === 'PENDING' && <BookingActions bookingId={b.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p className="text-center py-8 text-sm text-gray-500">Записей пока нет.</p>
        )}
      </div>
    </AdminLayout>
  );
}
