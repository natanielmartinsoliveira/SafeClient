import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';

function getToken(req: NextRequest) {
  return req.cookies.get('safeclient_token')?.value;
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const apiRes = await fetch(`${API_URL}/admin/users?${searchParams}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await apiRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: apiRes.status });
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  const body = await req.json();

  const apiRes = await fetch(`${API_URL}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await apiRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: apiRes.status });
}
