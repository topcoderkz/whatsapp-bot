'use client';

import { useRef, useState } from 'react';

interface AdminInfo {
  id: number;
  username: string;
  role: string;
  branchId: number | null;
  branchName: string | null;
}

interface Branch {
  id: number;
  name: string;
}

export function AdminCard({
  admin,
  branches,
  isSelf,
  updateAction,
  deleteAction,
}: {
  admin: AdminInfo;
  branches: Branch[];
  isSelf: boolean;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {editing ? (
        <form
          ref={formRef}
          action={updateAction}
          onSubmit={() => setEditing(false)}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
        >
          <input type="hidden" name="id" value={admin.id} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
            <input
              name="username"
              type="text"
              value={admin.username}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
            <input
              name="newPassword"
              type="password"
              minLength={6}
              placeholder="Оставьте пустым"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
            <select
              name="role"
              defaultValue={admin.role}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="BRANCH_MANAGER">Менеджер филиала</option>
              <option value="SUPER_ADMIN">Супер-админ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Филиал</label>
            <select
              name="branchId"
              defaultValue={admin.branchId ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">— Не назначен —</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
              {admin.username[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{admin.username}</p>
              <p className="text-sm text-gray-500">
                {admin.role === 'SUPER_ADMIN' ? 'Супер-админ' : 'Менеджер филиала'}
                {admin.branchName && ` — ${admin.branchName}`}
                {isSelf && <span className="ml-2 text-blue-600">(вы)</span>}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Изменить
            </button>
            {!isSelf && (
              <form action={deleteAction}>
                <input type="hidden" name="id" value={admin.id} />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Удалить
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
