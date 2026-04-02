import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import '../globals.css';
import HeaderBar from './components/HeaderBar';

export const metadata: Metadata = {
  title: 'SafeClient — Verifique antes de atender',
  description: 'Consulte relatos da comunidade sobre clientes e proteja-se.',
  icons: { icon: '/icon.png', apple: '/icon.png' },
};

function decodeToken(token: string): { email: string | null; role: string | null } {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return { email: payload.email ?? null, role: payload.role ?? null };
  } catch {
    return { email: null, role: null };
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) notFound();

  const messages = await getMessages();
  const store = await cookies();
  const token = store.get('safeclient_token')?.value;
  const { email, role } = token ? decodeToken(token) : { email: null, role: null };

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <HeaderBar userEmail={email} userRole={role} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
