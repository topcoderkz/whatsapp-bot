'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { ImageUpload } from '@/components/image-upload';

interface Branch {
  id: number;
  name: string;
  slug: string;
  priceImage: { imageUrl: string } | null;
}

export function PriceImageCard({ branch }: { branch: Branch }) {
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [currentImageUrl, setCurrentImageUrl] = useState(branch.priceImage?.imageUrl || null);
  const pendingUrlRef = useRef<string | null>(null);
  const isSubmittingRef = useRef(false);

  function saveImageUrl(url: string | null) {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    startTransition(async () => {
      try {
        const res = await fetch('/api/price-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branchId: branch.id, imageUrl: url || '' }),
        });

        if (res.ok) {
          setSaved(true);
          setCurrentImageUrl(url);
          setTimeout(() => setSaved(false), 2000);
        }
      } finally {
        isSubmittingRef.current = false;
        pendingUrlRef.current = null;
      }
    });
  }

  function handleImageUploaded(url: string) {
    // Don't save if it's the same as current
    if (url === currentImageUrl) return;
    // Don't save if already pending this exact url
    if (pendingUrlRef.current === url) return;

    pendingUrlRef.current = url;
    saveImageUrl(url);
  }

  function handleImageCleared() {
    if (!currentImageUrl) return;
    saveImageUrl(null);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{branch.name}</h3>
        {saved && <span className="text-xs text-green-600 font-medium">Сохранено</span>}
        {isPending && <span className="text-xs text-gray-400">Сохранение...</span>}
      </div>

      <ImageUpload
        name={`price-image-${branch.id}`}
        currentUrl={currentImageUrl}
        onImageUploaded={handleImageUploaded}
        onImageCleared={handleImageCleared}
      />
    </div>
  );
}
