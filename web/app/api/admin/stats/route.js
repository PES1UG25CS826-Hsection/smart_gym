import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function GET(request) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  try {
    const [m, t, a, r, e] = await Promise.all([
      query('admin', 'SELECT COUNT(*) AS c FROM member'),
      query('admin', 'SELECT COUNT(*) AS c FROM trainer'),
      query('admin', 'SELECT COUNT(DISTINCT member_id) AS c FROM v_active_memberships'),
      query('admin', "SELECT COALESCE(SUM(amount), 0) AS s FROM payment WHERE status = 'Success' AND payment_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"),
      query('admin', 'SELECT COUNT(*) AS c FROM v_active_memberships WHERE days_left BETWEEN 0 AND 7'),
    ]);
    return NextResponse.json({
      members: m[0].c,
      trainers: t[0].c,
      activeMemberships: a[0].c,
      revenueThisMonth: Number(r[0].s),
      expiringSoon: e[0].c,
    });
  } catch (err) {
    return dbError(err);
  }
}
