import type { LandingTranslations } from '@/i18n/types';

type Membership = {
  id: number;
  type: string;
  price: number;
  timeRange: string | null;
};

const TYPE_ORDER = [
  'VISITS_12_MORNING',
  'VISITS_12_FULL',
  'UNLIMITED_MORNING',
  'UNLIMITED_FULL',
  'MONTHS_3',
  'MONTHS_6',
  'MONTHS_12',
];

function getTypeLabel(type: string, dict: LandingTranslations): string {
  const map: Record<string, string> = {
    VISITS_12_MORNING: dict.pricing.visits_12,
    VISITS_12_FULL: dict.pricing.visits_12,
    UNLIMITED_MORNING: dict.pricing.unlimited,
    UNLIMITED_FULL: dict.pricing.unlimited,
    MONTHS_3: dict.pricing.months_3,
    MONTHS_6: dict.pricing.months_6,
    MONTHS_12: dict.pricing.months_12,
  };
  return map[type] || type;
}

function getTimeLabel(type: string, dict: LandingTranslations): string {
  if (type.includes('MORNING')) return dict.pricing.morning;
  if (type.includes('FULL')) return dict.pricing.full_day;
  return '—';
}

function formatPrice(price: number): string {
  return price.toLocaleString('ru-RU');
}

export function PricingTable({ memberships, dict }: { memberships: Membership[]; dict: LandingTranslations }) {
  const sorted = [...memberships].sort(
    (a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="py-4 px-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">
              {dict.pricing.membership}
            </th>
            <th className="py-4 px-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">
              {dict.pricing.time}
            </th>
            <th className="py-4 px-4 text-right text-sm font-bold text-gray-400 uppercase tracking-wider">
              {dict.pricing.price}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((m) => (
            <tr
              key={m.id}
              className="border-b border-border-subtle/50 hover:bg-brand/5 transition-colors"
            >
              <td className="py-4 px-4 text-white font-medium">
                {getTypeLabel(m.type, dict)}
              </td>
              <td className="py-4 px-4 text-gray-400 text-sm">
                {getTimeLabel(m.type, dict)}
              </td>
              <td className="py-4 px-4 text-right">
                <span className="text-xl font-bold text-brand">
                  {formatPrice(m.price)}
                </span>
                <span className="text-sm text-gray-500 ml-1">{dict.pricing.currency}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
