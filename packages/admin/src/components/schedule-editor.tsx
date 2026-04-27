'use client';

import { useState } from 'react';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

interface ScheduleEditorProps {
  name: string;
  defaultValue?: Record<string, string>;
}

export function ScheduleEditor({ name, defaultValue }: ScheduleEditorProps) {
  const [schedule, setSchedule] = useState(() => {
    const initial: Record<string, { enabled: boolean; time: string }> = {};
    DAYS.forEach(day => {
      initial[day] = {
        enabled: !!defaultValue?.[day],
        time: defaultValue?.[day] || '10:00',
      };
    });
    return initial;
  });

  function toggle(day: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  }

  function setTime(day: string, time: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], time },
    }));
  }

  const jsonValue: Record<string, string> = {};
  DAYS.forEach(day => {
    if (schedule[day].enabled) {
      jsonValue[day] = schedule[day].time;
    }
  });

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-2">Расписание</label>
      <div className="border border-gray-300 rounded-lg p-3 space-y-2">
        {DAYS.map(day => (
          <div key={day} className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer w-16">
              <input
                type="checkbox"
                checked={schedule[day].enabled}
                onChange={() => toggle(day)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm font-medium ${schedule[day].enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                {day}
              </span>
            </label>
            <input
              type="time"
              value={schedule[day].time}
              onChange={(e) => setTime(day, e.target.value)}
              disabled={!schedule[day].enabled}
              className={`px-2 py-1 border border-gray-300 rounded text-sm ${
                schedule[day].enabled ? 'text-gray-900' : 'text-gray-300 opacity-50 cursor-not-allowed'
              }`}
            />
          </div>
        ))}
      </div>
      <input type="hidden" name={name} value={JSON.stringify(jsonValue)} />
    </div>
  );
}
