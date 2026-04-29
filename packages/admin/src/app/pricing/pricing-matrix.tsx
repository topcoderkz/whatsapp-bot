'use client';

import { useState } from 'react';
import { updateMembershipPrice } from '@/lib/actions';

interface Branch {
  id: number;
  name: string;
}

interface Membership {
  id: number;
  branchId: number;
  name: string;
  type: string;
  price: number;
  timeRange: string | null;
  isActive: boolean;
}

export function PricingMatrix({ branches, memberships }: { branches: Branch[]; memberships: Membership[] }) {
  // Get unique types in order
  const types = Array.from(new Set(memberships.map(m => m.type)));
  const typeNames: Record<string, string> = {};
  memberships.forEach(m => { typeNames[m.type] = m.name; });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className="w-full min-w-[500px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Тип</th>
            {branches.map(b => (
              <th key={b.id} className="text-center px-4 py-3 text-sm font-medium text-gray-500">{b.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {types.map((type) => (
            <tr key={type} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3 text-sm font-medium text-gray-700">{typeNames[type]}</td>
              {branches.map(branch => {
                const m = memberships.find(mm => mm.type === type && mm.branchId === branch.id);
                return (
                  <td key={`${type}-${branch.id}`} className="px-4 py-3 text-center">
                    {m ? <PriceCell membership={m} /> : <span className="text-gray-300">—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriceCell({ membership }: { membership: Membership }) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(membership.price);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (price === membership.price) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateMembershipPrice(membership.id, price);
    } catch {
      setPrice(membership.price);
    }
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        autoFocus
        className="w-24 px-2 py-1 border border-blue-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
        disabled={saving}
      />
    );
  }

  return (
    <button
      onClick={() => { setPrice(membership.price); setEditing(true); }}
      className={`text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors ${membership.isActive ? 'text-gray-900' : 'text-gray-400 line-through'}`}
      title="Нажмите для редактирования"
    >
      {membership.price.toLocaleString('ru-RU')} тг
    </button>
  );
}
