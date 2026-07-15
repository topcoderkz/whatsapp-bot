'use client';

import { useState } from 'react';
import { importClients } from '@/lib/actions';
import Papa from 'papaparse';

interface Branch {
  id: number;
  name: string;
}

interface ParsedRow {
  phone: string;
  name?: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
  deleted: number;
  branchName: string;
}

export function ImportForm({ branches }: { branches: Branch[] }) {
  const [branchId, setBranchId] = useState<number | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      complete: (results) => {
        const parsed: ParsedRow[] = [];
        for (const row of results.data as any[]) {
          // First-header cell may carry a UTF-8 BOM (mobifitness export does).
          // Look up several aliases so we don't miss the phone/name column.
          const phone =
            row['Телефон'] ||
            row['﻿Телефон'] ||
            row['телефон'] ||
            row['phone'] ||
            '';
          const name =
            row['ФИО'] ||
            row['﻿ФИО'] ||
            row['фио'] ||
            row['Имя'] ||
            row['name'] ||
            '';
          if (!phone) continue;
          parsed.push({ phone: String(phone).trim(), name: String(name).trim() });
        }
        setRows(parsed);
        setStep('preview');
      },
    });
  }

  async function handleImport() {
    if (!branchId) return;
    setLoading(true);
    try {
      const res = await importClients({ branchId, replaceExisting, rows });
      setResult(res);
      setStep('done');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setRows([]);
    setFileName('');
    setResult(null);
    setStep('upload');
  }

  const selectedBranch = branches.find((b) => b.id === branchId);

  if (step === 'upload') {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Шаг 1: Выберите филиал</h2>
          <p className="text-xs text-gray-500 mb-3">
            Все клиенты из файла будут отнесены к этому филиалу. Один файл = один филиал.
          </p>
          <select
            value={branchId ?? ''}
            onChange={(e) => setBranchId(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">— выберите филиал —</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <label className="mt-4 flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="mt-1"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Заменить существующих клиентов этого филиала
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Все клиенты, привязанные к выбранному филиалу, будут удалены перед импортом.
                Клиенты других филиалов и без филиала не тронутся.
              </p>
            </div>
          </label>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Шаг 2: Загрузите CSV</h2>
          <p className="text-xs text-gray-500 mb-3">
            Разделитель «;». Ожидаемые колонки: <span className="font-mono">Телефон</span>,{' '}
            <span className="font-mono">ФИО</span>. Остальные колонки игнорируются. Поддерживается
            экспорт из mobifitness.
          </p>
          <input
            type="file"
            accept=".csv"
            disabled={!branchId}
            onChange={handleFile}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {!branchId && (
            <p className="mt-2 text-xs text-red-600">Сначала выберите филиал</p>
          )}
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-1">
          <p className="text-sm text-blue-900">
            <b>Файл:</b> {fileName}
          </p>
          <p className="text-sm text-blue-900">
            <b>Филиал:</b> {selectedBranch?.name}
          </p>
          <p className="text-sm text-blue-900">
            <b>Записей в файле:</b> {rows.length.toLocaleString('ru-RU')}
          </p>
          {replaceExisting && (
            <p className="text-sm text-orange-800 pt-1">
              ⚠ Существующие клиенты филиала «{selectedBranch?.name}» будут удалены перед импортом.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">#</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Телефон</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Имя</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 20).map((r, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2 text-xs text-gray-400">{i + 1}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{r.phone}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{r.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 20 && (
            <p className="text-center py-3 text-xs text-gray-400">
              ... и ещё {(rows.length - 20).toLocaleString('ru-RU')} записей
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleImport}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? 'Импортируем...'
              : `Импортировать ${rows.length.toLocaleString('ru-RU')} записей`}
          </button>
          <button
            onClick={reset}
            disabled={loading}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Импорт завершён</h2>
      <p className="text-sm text-gray-500 mb-6">
        Филиал: <b>{result!.branchName}</b>
      </p>
      <div className="flex justify-center gap-8 mb-6 flex-wrap">
        <div>
          <p className="text-3xl font-bold text-green-600">
            {result!.imported.toLocaleString('ru-RU')}
          </p>
          <p className="text-xs text-gray-500">Импортировано</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-yellow-600">
            {result!.skipped.toLocaleString('ru-RU')}
          </p>
          <p className="text-xs text-gray-500">Пропущено (номер уже есть)</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-red-600">
            {result!.errors.toLocaleString('ru-RU')}
          </p>
          <p className="text-xs text-gray-500">Ошибок в номерах</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-600">
            {result!.deleted.toLocaleString('ru-RU')}
          </p>
          <p className="text-xs text-gray-500">Удалено перед импортом</p>
        </div>
      </div>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        Загрузить ещё
      </button>
    </div>
  );
}
