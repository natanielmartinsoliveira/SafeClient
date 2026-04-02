import { cookies } from 'next/headers';
import SearchPage from './components/SearchPage';

function decodeEmail(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return payload.email ?? null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const store = await cookies();
  const token = store.get('safeclient_token')?.value;
  const email = token ? decodeEmail(token) : null;
  return <SearchPage userEmail={email} />;
}
