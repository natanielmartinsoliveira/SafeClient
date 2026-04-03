import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';

export async function POST(_req: NextRequest) {
  const token = (await cookies()).get('safeclient_token')?.value;
  if (!token) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

  const apiRes = await fetch(`${API_URL}/admin/cron/run`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await apiRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: apiRes.status });
}
