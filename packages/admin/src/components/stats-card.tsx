export function StatsCard({
  title,
  value,
  icon,
  accent = false,
}: {
  title: string;
  value: number | string;
  icon: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-6 ${accent ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
      <p className={`text-3xl font-bold ${accent ? 'text-blue-700' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}
