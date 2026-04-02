'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('Login');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message ?? t('errorInvalid'));
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setError(t('errorConnection'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex flex-col items-center justify-center px-4 py-12"
      style={{ minHeight: 'calc(100vh - 57px)', background: '#F5F0FF' }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-50" style={{ background: '#DDD4F0' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-40" style={{ background: '#DDD4F0' }} />
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-center gap-8" style={{ zIndex: 1 }}>
        <img src="/logo.png" alt="SafeClient" className="w-52 h-auto drop-shadow-lg" />

        <div
          className="w-full rounded-2xl shadow-xl p-8 flex flex-col gap-5"
          style={{ background: '#FFFFFF', border: '1.5px solid #E0D8F4' }}
        >
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#2E1B6E' }}>{t('title')}</h1>
            <p className="text-sm mt-1" style={{ color: '#9887B8' }}>{t('subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#6B5B9E' }}>{t('emailLabel')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl outline-none text-sm transition-all"
                style={{ background: '#F0ECFF', border: '1.5px solid #E0D8F4', color: '#2E1B6E' }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: '#6B5B9E' }}>{t('passwordLabel')}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                style={{ background: '#F0ECFF', border: '1.5px solid #E0D8F4', color: '#2E1B6E' }}
              />
            </div>

            {error && (
              <p className="text-xs text-center rounded-lg px-3 py-2" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)' }}
            >
              {loading ? t('loading') : t('submit')}
            </button>
          </form>

          <p className="text-xs text-center" style={{ color: '#9887B8' }}>
            {t('noAccount')}{' '}
            <Link href="/cadastro" className="font-semibold" style={{ color: '#7B52B8' }}>
              {t('createLink')}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
