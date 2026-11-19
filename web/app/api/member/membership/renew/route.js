import { NextResponse } from 'next/server';
import { getPool } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';
import { PLANS, METHODS } from '@/lib/plans';

export async function POST(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  const body = await request.json().catch(() => null);
  const plan = PLANS[body?.plan];
  if (!plan || !METHODS.includes(body?.method)) {
    return NextResponse.json({ error: 'Choose a valid plan and payment method' }, { status: 400 });
  }
  const ref = `APP-${Date.now()}-${session.id}`;
  // OUT parameters live in one connection, so use a dedicated connection (not pool.query)
  const conn = await getPool('member').getConnection();
  try {
    await conn.query('CALL sp_renew_membership(?, ?, ?, ?, ?, ?, @new_id)',
      [session.id, body.plan, plan.months, plan.amount, body.method, ref]);
    const [[row]] = await conn.query('SELECT @new_id AS id');
    return NextResponse.json({ ok: true, membership_id: row.id, reference: ref, message: `${body.plan} membership activated` });
  } catch (err) {
    return dbError(err);
  } finally {
    conn.release();
  }
}
