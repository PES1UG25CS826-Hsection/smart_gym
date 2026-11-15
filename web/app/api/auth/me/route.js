import { NextResponse } from 'next/server';
import { verifyToken, COOKIE } from '@/lib/auth';

export async function GET(request) {
  const token = request.cookies.get(COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  return NextResponse.json({ user: { id: payload.sub, role: payload.role, name: payload.name } });
}
