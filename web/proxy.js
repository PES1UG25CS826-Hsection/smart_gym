import { NextResponse } from 'next/server';
import { verifyToken, COOKIE } from '@/lib/auth';

const ROLES = ['admin', 'trainer', 'member'];

// Route protection: /admin, /trainer, /member pages and /api/<role> endpoints
export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');
  const section = pathname.split('/')[isApi ? 2 : 1];
  if (!ROLES.includes(section)) return NextResponse.next();

  const token = request.cookies.get(COOKIE)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    if (isApi) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (user.role !== section) {
    if (isApi) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.redirect(new URL(`/${user.role}`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', '/trainer/:path*', '/member/:path*',
    '/api/admin/:path*', '/api/trainer/:path*', '/api/member/:path*',
  ],
};
