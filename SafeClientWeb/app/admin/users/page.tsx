'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/users?page=${page}&limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.data);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Excluir o usuário ${email}? Esta ação é irreversível.`)) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    load();
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black" style={{ color: '#2E1B6E' }}>
          Usuários <span className="text-base font-normal" style={{ color: '#9887B8' }}>({total})</span>
        </h1>
        <Link href="/admin/users/new"
          className="text-sm font-bold px-5 py-2 rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)' }}>
          + Novo usuário
        </Link>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #E0D8F4' }}>
        <table className="w-full text-sm" style={{ background: '#FFFFFF' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E0D8F4', background: '#F9F7FF' }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#6B5B9E' }}>E-mail</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#6B5B9E' }}>Role</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: '#6B5B9E' }}>Desde</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8" style={{ color: '#9887B8' }}>Carregando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8" style={{ color: '#9887B8' }}>Nenhum usuário encontrado.</td></tr>
            ) : users.map((u, i) => (
              <tr key={u.id} style={{ borderTop: i > 0 ? '1px solid #F0ECFF' : undefined }}>
                <td className="px-4 py-3 font-medium" style={{ color: '#2E1B6E' }}>{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={u.role === 'admin'
                      ? { background: '#FEF3C7', color: '#92400E' }
                      : { background: '#F0ECFF', color: '#7B52B8' }}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: '#9887B8' }}>
                  {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 flex gap-2 justify-end">
                  <Link href={`/admin/users/${u.id}`}
                    className="text-xs px-3 py-1 rounded-lg font-medium"
                    style={{ background: '#F0ECFF', color: '#7B52B8' }}>
                    Editar
                  </Link>
                  <button onClick={() => handleDelete(u.id, u.email)}
                    className="text-xs px-3 py-1 rounded-lg font-medium"
                    style={{ background: '#FEE2E2', color: '#DC2626' }}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
            style={{ background: '#F0ECFF', color: '#7B52B8' }}>← Anterior</button>
          <span className="px-4 py-2 text-sm" style={{ color: '#9887B8' }}>{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
            style={{ background: '#F0ECFF', color: '#7B52B8' }}>Próxima →</button>
        </div>
      )}
    </div>
  );
}
