import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';

function getToken(req: NextRequest) {
  return req.cookies.get('safeclient_token')?.value;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  const { id } = await params;

  const apiRes = await fetch(`${API_URL}/admin/reports/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await apiRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: apiRes.status });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const apiRes = await fetch(`${API_URL}/admin/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await apiRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: apiRes.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  const { id } = await params;

  await fetch(`${API_URL}/admin/reports/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return new NextResponse(null, { status: 204 });
}
