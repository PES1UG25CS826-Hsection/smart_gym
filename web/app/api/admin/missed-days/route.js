import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

// Recursive CTE builds the last 30 calendar days; LEFT JOIN finds days with no visit
export async function GET(request) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const memberId = Number(new URL(request.url).searchParams.get('memberId'));
  if (!Number.isInteger(memberId) || memberId < 1) return NextResponse.json({ error: 'Invalid member' }, { status: 400 });
  try {
    const days = await query('admin',
      `WITH RECURSIVE calendar AS (
         SELECT DATE_SUB(CURDATE(), INTERVAL 29 DAY) AS d
         UNION ALL
         SELECT DATE_ADD(d, INTERVAL 1 DAY) FROM calendar WHERE d < CURDATE())
       SELECT c.d AS missed_day FROM calendar c
       LEFT JOIN attendance a ON a.date = c.d AND a.member_id = ?
       WHERE a.attendance_id IS NULL ORDER BY c.d`, [memberId]);
    return NextResponse.json({ days });
  } catch (err) {
    return dbError(err);
  }
}
