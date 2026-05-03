'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  name: string;
  currentUrl?: string | null;
  className?: string;
  onImageUploaded?: (url: string) => void;
  onImageCleared?: () => void;
}

export function ImageUpload({ name, currentUrl, className, onImageUploaded, onImageCleared }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [uploadedUrl, setUploadedUrl] = useState<string>(currentUrl || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // Initialize on mount (only once)
  if (!initializedRef.current && currentUrl) {
    setUploadedUrl(currentUrl);
    setPreviewUrl(currentUrl);
    initializedRef.current = true;
  }

  async function handleFile(file: File) {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Недопустимый формат. Используйте JPG, PNG или WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой. Максимум 5 МБ.');
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка загрузки');
        setPreviewUrl(uploadedUrl || null);
        setUploadedUrl(uploadedUrl);
      } else {
        setUploadedUrl(data.url);
        setPreviewUrl(data.url);
        // Only call callback if URL actually changed
        if (data.url !== currentUrl) {
          onImageUploaded?.(data.url);
        }
      }
    } catch {
      setError('Ошибка загрузки. Попробуйте снова.');
      setPreviewUrl(uploadedUrl || null);
      setUploadedUrl(uploadedUrl);
    }

    URL.revokeObjectURL(localPreview);
    setUploading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleClear() {
    setPreviewUrl(null);
    setUploadedUrl('');
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
    onImageCleared?.();
  }

  return (
    <div className={className}>
      <input type="hidden" name={name} value={uploadedUrl} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Превью"
            className="w-full h-40 object-cover rounded-lg border border-gray-200"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg">
              <span className="text-sm text-gray-600">Загрузка...</span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-1.5 bg-white rounded-md shadow text-xs text-gray-600 hover:bg-gray-50"
            >
              Заменить
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 bg-white rounded-md shadow text-xs text-red-600 hover:bg-red-50"
            >
              Удалить
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`w-full h-40 flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }`}
        >
          {uploading ? (
            <span className="text-sm text-gray-500">Загрузка...</span>
          ) : (
            <>
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-500">Нажмите или перетащите изображение</span>
              <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP до 5 МБ</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
