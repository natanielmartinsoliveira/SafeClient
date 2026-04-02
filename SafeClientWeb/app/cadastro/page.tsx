'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CadastroPage() {
  const router = useRouter();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [password2, setPassword2]   = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== password2) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter ao menos 8 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.message;
        setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Erro ao criar conta.'));
        return;
      }

      // Faz login automático após cadastro
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.ok) {
        router.push('/');
        router.refresh();
      } else {
        router.push('/login?registered=1');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center px-4 py-12"
      style={{ minHeight: 'calc(100vh - 57px)', background: '#F5F0FF' }}>

      {/* Decoração */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-50"
          style={{ background: '#DDD4F0' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-40"
          style={{ background: '#DDD4F0' }} />
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo */}
        <img src="/logo.png" alt="SafeClient" className="w-52 h-auto drop-shadow-lg" />

        {/* Card */}
        <div className="w-full rounded-2xl shadow-xl p-8 flex flex-col gap-5"
          style={{ background: '#FFFFFF', border: '1.5px solid #E0D8F4' }}>

          <div>
            <h1 className="text-xl font-bold" style={{ color: '#2E1B6E' }}>Criar conta</h1>
            <p className="text-sm mt-1" style={{ color: '#9887B8' }}>
              Junte-se à comunidade SafeClient
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#6B5B9E' }}>
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                style={{
                  background: '#F0ECFF',
                  border: '1.5px solid #E0D8F4',
                  color: '#2E1B6E',
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#6B5B9E' }}>
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mín. 8 caracteres"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                style={{
                  background: '#F0ECFF',
                  border: '1.5px solid #E0D8F4',
                  color: '#2E1B6E',
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#6B5B9E' }}>
                Confirmar senha
              </label>
              <input
                type="password"
                required
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="repita a senha"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                style={{
                  background: '#F0ECFF',
                  border: '1.5px solid #E0D8F4',
                  color: '#2E1B6E',
                }}
              />
            </div>

            {error && (
              <p className="text-xs text-center rounded-lg px-3 py-2"
                style={{ background: '#FEE2E2', color: '#DC2626' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)' }}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-xs text-center" style={{ color: '#9887B8' }}>
            Já tem conta?{' '}
            <Link href="/login"
              className="font-semibold"
              style={{ color: '#7B52B8' }}>
              Entrar
            </Link>
          </p>
        </div>

        <p className="text-xs text-center" style={{ color: '#9887B8' }}>
          Ao criar uma conta você concorda com nossos termos de uso e LGPD.
        </p>
      </div>
    </main>
  );
}
