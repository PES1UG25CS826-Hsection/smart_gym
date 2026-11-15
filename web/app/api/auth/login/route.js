import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { signToken, verifyPassword, COOKIE } from '@/lib/auth';
import { ROLE_TABLES } from '@/lib/rbac';

export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const { email, password, role } = body;
  const cfg = ROLE_TABLES[role];
  if (!cfg || typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return NextResponse.json({ error: 'Email, password and role are required' }, { status: 400 });
  }

  const rows = await query(
    'auth',
    `SELECT ${cfg.idCol} AS id, name, email, password_hash FROM ${cfg.table} WHERE email = ? LIMIT 1`,
    [email.trim().toLowerCase()]
  );
  const user = rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = await signToken({ sub: String(user.id), role, name: user.name });
  const res = NextResponse.json({ ok: true, role, name: user.name });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return res;
}
