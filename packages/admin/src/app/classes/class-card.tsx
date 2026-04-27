'use client';

import { useState } from 'react';
import { updateGroupClass, toggleGroupClass } from '@/lib/actions';
import { ScheduleEditor } from '@/components/schedule-editor';

interface ClassCardProps {
  groupClass: {
    id: number;
    name: string;
    description: string | null;
    capacity: number;
    schedule: Record<string, string>;
    trainerId: number | null;
    isActive: boolean;
    branch: { name: string };
    trainer: { name: string } | null;
  };
  trainers: Array<{ id: number; name: string }>;
}

export function ClassCard({ groupClass: c, trainers }: ClassCardProps) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(formData: FormData) {
    await updateGroupClass(c.id, formData);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${!c.isActive ? 'opacity-50' : ''}`}>
      {editing ? (
        <form action={handleSave} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Название</label>
              <input name="name" defaultValue={c.name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Тренер</label>
              <select name="trainerId" defaultValue={c.trainerId || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Не выбран</option>
                {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Мест</label>
              <input name="capacity" type="number" defaultValue={c.capacity} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Описание</label>
            <input name="description" defaultValue={c.description || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <ScheduleEditor name="schedule" defaultValue={c.schedule} />
          <div className="flex items-center gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Сохранить
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
              {saved && <span className="text-xs text-green-600">Сохранено</span>}
            </div>
            <p className="text-xs text-gray-500">
              {c.branch.name} {c.trainer && `• Тренер: ${c.trainer.name}`} • Мест: {c.capacity}
            </p>
            {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
            <p className="text-xs text-gray-400 mt-1">
              {Object.entries(c.schedule).map(([day, time]) => `${day}: ${time}`).join(', ') || 'Расписание не задано'}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-medium px-3 py-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              Редактировать
            </button>
            <form action={toggleGroupClass.bind(null, c.id, !c.isActive)} className="inline">
              <button type="submit" className={`text-xs font-medium px-3 py-1.5 rounded ${c.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                {c.isActive ? 'Деактивировать' : 'Активировать'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
