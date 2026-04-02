'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from './LocaleSwitcher';

interface Props {
  userEmail: string | null;
  userRole?: string | null;
}

export default function HeaderBar({ userEmail, userRole }: Props) {
  const t = useTranslations('Header');
  const pathname = usePathname();
  const router = useRouter();

  const isResultado = pathname.startsWith('/resultado');
  const isLogin = pathname === '/login';
  const isCadastro = pathname === '/cadastro';
  const isRelato = pathname === '/relato';

  const purple = isResultado;
  const bg = purple ? '#7B52B8' : '#FFFFFF';
  const border = purple ? 'none' : '1px solid #E8E0F8';

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-50 w-full flex items-center justify-between px-6 py-3"
      style={{ background: bg, borderBottom: border }}
    >
      {/* Logo */}
      <Link href="/">
        <img
          src={purple ? '/logo_branco.png' : '/logo.png'}
          alt="SafeClient"
          className="h-8 w-auto"
        />
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Locale switcher */}
        <div style={{ color: purple ? 'rgba(255,255,255,0.85)' : '#7B52B8' }}>
          <LocaleSwitcher />
        </div>

        {userEmail ? (
          <>
            {!isRelato && (
              <Link
                href="/relato"
                className="text-sm font-bold px-5 py-1.5 rounded-full text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)' }}
              >
                {t('postReport')}
              </Link>
            )}

            {userRole === 'admin' && (
              <Link
                href="/admin"
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}
              >
                {t('admin')}
              </Link>
            )}

            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 cursor-default"
              style={{ background: 'linear-gradient(135deg, #8B6FC4, #5C3D9E)' }}
              title={userEmail}
            >
              {userEmail[0].toUpperCase()}
            </div>

            <button
              onClick={handleLogout}
              className="text-sm font-medium px-4 py-1.5 rounded-full transition-colors hover:opacity-80"
              style={
                purple
                  ? { color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.35)' }
                  : { color: '#7B52B8', border: '1px solid #D4C8F0' }
              }
            >
              {t('logout')}
            </button>
          </>
        ) : isLogin ? (
          <Link
            href="/cadastro"
            className="text-sm font-bold px-5 py-1.5 rounded-full text-white"
            style={{ background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)' }}
          >
            {t('register')}
          </Link>
        ) : isCadastro ? (
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-1.5 rounded-full transition-colors hover:bg-purple-50"
            style={{ color: '#7B52B8', border: '1px solid #D4C8F0' }}
          >
            {t('login')}
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-1.5 rounded-full transition-colors hover:opacity-80"
              style={
                purple
                  ? { color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.35)' }
                  : { color: '#7B52B8', border: '1px solid #D4C8F0' }
              }
            >
              {t('login')}
            </Link>
            <Link
              href="/cadastro"
              className="text-sm font-bold px-5 py-1.5 rounded-full text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #8B6FC4 0%, #5C3D9E 100%)' }}
            >
              {t('register')}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
