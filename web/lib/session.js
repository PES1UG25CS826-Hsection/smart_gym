import { NextResponse } from 'next/server';
import { verifyToken, COOKIE } from '@/lib/auth';

export async function getSession(request) {
  const token = request.cookies.get(COOKIE)?.value;
  const p = token ? await verifyToken(token) : null;
  return p ? { id: Number(p.sub), role: p.role, name: p.name } : null;
}

// Second line of defence inside every API route (the proxy is the first)
export async function requireRole(request, ...roles) {
  const session = await getSession(request);
  if (!session) return { error: NextResponse.json({ error: 'Not logged in' }, { status: 401 }) };
  if (!roles.includes(session.role)) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { session };
}

// 1644 = error raised by SIGNAL in our triggers/procedures (business-rule violation)
export function dbError(err) {
  console.error(err);
  if (err.errno === 1644) return NextResponse.json({ error: err.sqlMessage }, { status: 400 });
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
}
