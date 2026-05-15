'use client';

import { useState, useRef } from 'react';

interface Photo {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

interface BranchPhotoManagerProps {
  branch: {
    id: number;
    name: string;
    photos: Photo[];
  };
}

export function BranchPhotoManager({ branch }: BranchPhotoManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>(branch.photos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef<number | null>(null);

  async function handleUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Недопустимый формат файла');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой. Максимум 5 МБ.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Ошибка загрузки файла');
      const { url } = await uploadRes.json();

      const photoRes = await fetch('/api/branch-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId: branch.id, imageUrl: url }),
      });
      if (!photoRes.ok) throw new Error('Ошибка сохранения фото');
      const photo = await photoRes.json();

      setPhotos((prev) => [...prev, photo]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photoId: number) {
    try {
      const res = await fetch('/api/branch-photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      });
      if (!res.ok) throw new Error('Ошибка удаления');
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
  }

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function handleDrop(targetIndex: number) {
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === targetIndex) return;

    const updated = [...photos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setPhotos(updated);
    dragIndexRef.current = null;

    try {
      await fetch('/api/branch-photos/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoIds: updated.map((p) => p.id) }),
      });
    } catch {
      setPhotos(branch.photos);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(handleUpload);
    e.target.value = '';
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{branch.name}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-grab active:cursor-grabbing group"
          >
            <img
              src={photo.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
            {index === 0 && (
              <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                Главное
              </span>
            )}
            <button
              onClick={() => handleDelete(photo.id)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
            >
              &times;
            </button>
          </div>
        ))}

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs">Добавить</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-gray-400">
        Перетаскивайте фото для изменения порядка. Первое фото будет главным.
      </p>
    </div>
  );
}
