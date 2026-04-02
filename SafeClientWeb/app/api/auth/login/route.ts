import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const apiRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!apiRes.ok) {
    const err = await apiRes.json().catch(() => ({}));
    return NextResponse.json(err, { status: apiRes.status });
  }

  const { access_token, email } = await apiRes.json();

  const res = NextResponse.json({ email });
  res.cookies.set('safeclient_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
    sameSite: 'lax',
  });

  return res;
}
