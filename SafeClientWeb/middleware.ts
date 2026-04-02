import { NextRequest, NextResponse } from 'next/server';

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('safeclient_token')?.value;

  // Redireciona /login e /cadastro para home se já estiver logado
  const isAuthPage = pathname === '/login' || pathname === '/cadastro';
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Protege /admin/* — redireciona para / se não for admin
  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
    const payload = decodePayload(token);
    if (payload?.role !== 'admin') return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/cadastro', '/admin/:path*'],
};
