'use client';

import { useState } from 'react';

export function ConfirmButton({
  onConfirm,
  label,
  confirmMessage,
  variant = 'danger',
  className = '',
}: {
  onConfirm: () => Promise<void> | void;
  label: string;
  confirmMessage: string;
  variant?: 'danger' | 'primary';
  className?: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const colors = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white';

  if (showConfirm) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-600">{confirmMessage}</span>
        <button
          onClick={async () => {
            setLoading(true);
            await onConfirm();
            setLoading(false);
            setShowConfirm(false);
          }}
          disabled={loading}
          className={`px-3 py-1 rounded text-xs font-medium ${colors} disabled:opacity-50`}
        >
          {loading ? '...' : 'Да'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1 rounded text-xs font-medium bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          Нет
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={`px-3 py-1.5 rounded text-xs font-medium ${colors} ${className}`}
    >
      {label}
    </button>
  );
}
