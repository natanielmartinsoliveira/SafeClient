import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RelatoPage from '../components/RelatoPage';

function decodeEmail(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return payload.email ?? null;
  } catch {
    return null;
  }
}

export default async function RelatoRoute() {
  const store = await cookies();
  const token = store.get('safeclient_token')?.value;
  if (!token) redirect('/login');
  const email = decodeEmail(token);
  return <RelatoPage userEmail={email ?? ''} />;
}
