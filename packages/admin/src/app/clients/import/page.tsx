'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { importClients } from '@/lib/actions';
import Papa from 'papaparse';

interface ParsedRow {
  phone: string;
  name?: string;
  branch?: string;
}

export default function ImportClientsPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((row: any) => ({
          phone: row.phone || row['Телефон'] || row['телефон'] || '',
          name: row.name || row['ФИО'] || row['фио'] || row['Имя'] || row['имя'] || '',
          branch: row.branch || row['Филиал'] || row['филиал'] || '',
        }));
        setRows(parsed);
        setStep('preview');
      },
    });
  }

  async function handleImport() {
    setLoading(true);
    const res = await importClients(rows);
    setResult(res);
    setStep('done');
    setLoading(false);
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Импорт клиентов из CSV</h1>

      {step === 'upload' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Загрузите CSV файл с разделителем «;» и колонками:</p>
            <p className="text-xs text-gray-400">ФИО;Телефон (филиал — необязательно)</p>
          </div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      )}

      {step === 'preview' && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-800">
              Найдено {rows.length} записей. Дубликаты (по номеру телефона) будут пропущены.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">#</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Телефон</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Имя</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Филиал</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2 text-xs text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{r.phone}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{r.name || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{r.branch || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 20 && (
              <p className="text-center py-3 text-xs text-gray-400">... и ещё {rows.length - 20} записей</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleImport}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Импортируем...' : `Импортировать ${rows.length} записей`}
            </button>
            <button
              onClick={() => { setRows([]); setStep('upload'); }}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {step === 'done' && result && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Импорт завершён</h2>
          <div className="flex justify-center gap-8 mb-6">
            <div>
              <p className="text-3xl font-bold text-green-600">{result.imported}</p>
              <p className="text-xs text-gray-500">Импортировано</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-600">{result.skipped}</p>
              <p className="text-xs text-gray-500">Пропущено (дубликаты)</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">{result.errors}</p>
              <p className="text-xs text-gray-500">Ошибок</p>
            </div>
          </div>
          <button
            onClick={() => { setRows([]); setResult(null); setStep('upload'); }}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Загрузить ещё
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
