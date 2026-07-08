import { AdminLayout } from '@/components/admin-layout';
import { LocalTime } from '@/components/local-time';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  SENT: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-cyan-100 text-cyan-700',
  READ: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

export default async function NotificationsPage() {
  const logs = await prisma.notificationLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 300,
    include: {
      lead: { include: { branch: { select: { id: true, name: true, managerPhone: true } } } },
    },
  });

  // Aggregate lead-notification outcomes by branch — the question we care about.
  // We filter by leadId (not template name) so the summary keeps working even
  // as the outbound template changes over time.
  const summary: Record<string, Record<string, number>> = {};
  for (const log of logs) {
    if (log.leadId == null) continue;
    const branchName = log.lead?.branch?.name ?? '— (no branch)';
    summary[branchName] ||= {};
    summary[branchName][log.status] = (summary[branchName][log.status] || 0) + 1;
  }

  const branchNames = Object.keys(summary).sort();
  const totalLeadFollowup = branchNames.reduce(
    (n, name) => n + Object.values(summary[name]).reduce((a, b) => a + b, 0),
    0
  );

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Уведомления</h1>
      <p className="text-sm text-gray-500 mb-6">
        История отправок шаблонов WhatsApp. Сверху — сводка по доставке уведомлений о лидах менеджерам по филиалам.
      </p>

      {/* Per-branch summary for lead notifications */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Уведомления о лидах по филиалам ({totalLeadFollowup} из последних 300)
      </h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto mb-8">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Филиал</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">PENDING</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">SENT</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">DELIVERED</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">READ</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">FAILED</th>
            </tr>
          </thead>
          <tbody>
            {branchNames.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6 text-sm text-gray-500">Нет уведомлений о лидах в окне.</td></tr>
            ) : branchNames.map((name) => (
              <tr key={name} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
                <td className="px-4 py-3 text-sm">{summary[name].PENDING || 0}</td>
                <td className="px-4 py-3 text-sm text-blue-700">{summary[name].SENT || 0}</td>
                <td className="px-4 py-3 text-sm text-cyan-700">{summary[name].DELIVERED || 0}</td>
                <td className="px-4 py-3 text-sm text-green-700">{summary[name].READ || 0}</td>
                <td className="px-4 py-3 text-sm text-red-600">{summary[name].FAILED || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Raw log */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Последние 300 отправок</h2>
      <p className="text-xs text-gray-500 mb-3">
        SENT = Meta приняла сообщение в API. DELIVERED = доставлено на устройство. READ = открыто получателем.
        Если у филиала SENT много, а DELIVERED/READ — нули, скорее всего на номере менеджера нет WhatsApp.
      </p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Создано</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Шаблон</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Филиал</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Лид</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Получатель</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Статус</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Отправлено</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Доставлено</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Прочитано</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Ошибка</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2 text-xs text-gray-500"><LocalTime iso={log.createdAt.toISOString()} /></td>
                <td className="px-4 py-2 text-xs text-gray-700 font-mono">{log.templateName || '—'}</td>
                <td className="px-4 py-2 text-xs text-gray-700">{log.lead?.branch?.name || '—'}</td>
                <td className="px-4 py-2 text-xs text-gray-500">{log.lead?.phone || (log.leadId ? `#${log.leadId}` : '—')}</td>
                <td className="px-4 py-2 text-xs text-gray-700 font-medium">{log.recipientPhone}</td>
                <td className="px-4 py-2 text-xs">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLOR[log.status] || 'bg-gray-100 text-gray-700'}`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">{log.sentAt ? <LocalTime iso={log.sentAt.toISOString()} /> : '—'}</td>
                <td className="px-4 py-2 text-xs text-gray-500">{log.deliveredAt ? <LocalTime iso={log.deliveredAt.toISOString()} /> : '—'}</td>
                <td className="px-4 py-2 text-xs text-gray-500">{log.readAt ? <LocalTime iso={log.readAt.toISOString()} /> : '—'}</td>
                <td className="px-4 py-2 text-xs text-red-600 max-w-[240px] truncate" title={log.errorMessage || ''}>{log.errorMessage || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="text-center py-8 text-sm text-gray-500">Записей пока нет.</p>
        )}
      </div>
    </AdminLayout>
  );
}
