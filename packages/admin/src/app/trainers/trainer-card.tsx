'use client';

import { useState } from 'react';
import { updateTrainer, toggleTrainer } from '@/lib/actions';
import { ImageUpload } from '@/components/image-upload';

interface TrainerCardProps {
  trainer: {
    id: number;
    name: string;
    specialization: string | null;
    photoUrl: string | null;
    bio: string | null;
    experienceYears: number | null;
    isActive: boolean;
    branch: { name: string };
  };
}

export function TrainerCard({ trainer: t }: TrainerCardProps) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(formData: FormData) {
    await updateTrainer(t.id, formData);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${!t.isActive ? 'opacity-50' : ''}`}>
      {editing ? (
        <form action={handleSave} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Имя</label>
              <input name="name" defaultValue={t.name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Специализация</label>
              <input name="specialization" defaultValue={t.specialization || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Опыт (лет)</label>
              <input name="experienceYears" type="number" defaultValue={t.experienceYears || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">О тренере</label>
            <textarea name="bio" defaultValue={t.bio || ''} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Фото</label>
            <ImageUpload name="photoUrl" currentUrl={t.photoUrl} />
          </div>
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
        <div className="flex items-start gap-4">
          {t.photoUrl && (
            <img src={t.photoUrl} alt={t.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">{t.name}</h3>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {t.isActive ? 'Активен' : 'Неактивен'}
              </span>
              {saved && <span className="text-xs text-green-600">Сохранено</span>}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {t.branch.name}
              {t.specialization && ` \u2022 ${t.specialization}`}
              {t.experienceYears && ` \u2022 ${t.experienceYears} лет опыта`}
            </p>
            {t.bio && <p className="text-xs text-gray-400 mt-1">{t.bio}</p>}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-medium px-3 py-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              Редактировать
            </button>
            <form action={toggleTrainer.bind(null, t.id, !t.isActive)} className="inline">
              <button type="submit" className={`text-xs font-medium px-3 py-1.5 rounded ${t.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                {t.isActive ? 'Деактивировать' : 'Активировать'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
