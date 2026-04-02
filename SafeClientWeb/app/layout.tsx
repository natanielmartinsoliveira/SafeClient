import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import HeaderBar from './components/HeaderBar';

export const metadata: Metadata = {
  title: 'SafeClient — Verifique antes de atender',
  description: 'Consulte relatos da comunidade sobre clientes e proteja-se.',
  icons: { icon: '/icon.png', apple: '/icon.png' },
};

function decodeToken(token: string): { email: string | null; role: string | null } {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString(),
    );
    return { email: payload.email ?? null, role: payload.role ?? null };
  } catch {
    return { email: null, role: null };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const token = store.get('safeclient_token')?.value;
  const { email, role } = token ? decodeToken(token) : { email: null, role: null };

  return (
    <html lang="pt-BR">
      <body>
        <HeaderBar userEmail={email} userRole={role} />
        {children}
      </body>
    </html>
  );
}
