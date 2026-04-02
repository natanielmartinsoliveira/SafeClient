'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminNewUserPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    setLoading(false);
    if (res.ok) {
      router.push('/admin/users');
    } else {
      const data = await res.json().catch(() => ({}));
      const msg = data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Erro ao criar usuário.'));
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-sm" style={{ color: '#9887B8' }}>← Voltar</button>
        <h1 className="text-2xl font-black" style={{ color: '#2E1B6E' }}>Novo Usuário</h1>
      </div>

      <div className="rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: '#FFFFFF', border: '1.5px solid #E0D8F4' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold" style={{ color: '#6B5B9E' }}>E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
              className="w-full px-4 py-3 rounded-xl outline-none text-sm"
              style={{ background: '#F0ECFF', border: '1.5px solid #E0D8F4', color: '#2E1B6E' }} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold" style={{ color: '#6B5B9E' }}>Senha (mín. 8 caracteres)</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl outline-none text-sm"
              style={{ background: '#F0ECFF', border: '1.5px solid #E0D8F4', color: '#2E1B6E' }} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold" style={{ color: '#6B5B9E' }}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
              className="w-full px-4 py-3 rounded-xl outline-none text-sm"
              style={{ background: '#F0ECFF', border: '1.5px solid #E0D8F4', color: '#2E1B6E' }}>
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <p className="text-xs text-center rounded-lg px-3 py-2"
            style={{ background: '#FEE2E2', color: '#DC2626' }}>{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)' }}>
            {loading ? 'Criando...' : 'Criar usuário'}
          </button>
        </form>
      </div>
    </div>
  );
}
