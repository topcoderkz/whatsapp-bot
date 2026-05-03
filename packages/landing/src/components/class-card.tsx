import type { LandingTranslations } from '@/i18n/types';

type GroupClass = {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  schedule: unknown;
  trainer: { name: string } | null;
  branch: { name: string };
};

export function ClassCard({ groupClass, dict }: { groupClass: GroupClass; dict: LandingTranslations }) {
  const schedule = groupClass.schedule as Record<string, string>;
  const scheduleEntries = Object.entries(schedule);

  return (
    <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 hover:border-brand/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-white">{groupClass.name}</h3>
        <span className="shrink-0 text-xs bg-brand/10 text-brand font-bold px-3 py-1 rounded-full">
          {groupClass.capacity} {dict.classes.spots}
        </span>
      </div>

      {groupClass.description && (
        <p className="mt-2 text-sm text-gray-400">{groupClass.description}</p>
      )}

      {groupClass.trainer && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-brand">👨‍🏫</span>
          <span className="text-gray-300">{groupClass.trainer.name}</span>
        </div>
      )}

      {scheduleEntries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            {dict.classes.schedule}
          </div>
          <div className="flex flex-wrap gap-2">
            {scheduleEntries.map(([day, time]) => (
              <span
                key={day}
                className="text-xs bg-surface-2 text-gray-300 px-2.5 py-1 rounded-lg"
              >
                {day}: {time}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">{groupClass.branch.name}</div>
    </div>
  );
}
