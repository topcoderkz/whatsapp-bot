'use client';

import { useState } from 'react';

interface WorkingHoursInputProps {
  name: string;
  defaultValue?: string;
}

export function WorkingHoursInput({ name, defaultValue }: WorkingHoursInputProps) {
  const [open, close] = (defaultValue || '07:00-23:00').split('-');
  const [from, setFrom] = useState(open.trim());
  const [to, setTo] = useState(close.trim());

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Часы работы</label>
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <span className="text-sm text-gray-400">&mdash;</span>
        <input
          type="time"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <input type="hidden" name={name} value={`${from}-${to}`} />
    </div>
  );
}
