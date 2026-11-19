import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function GET(request) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const year = new Date().getFullYear();
  try {
    const [revenueResult, inactive, workload, top] = await Promise.all([
      // stored procedure that uses a CTE
      query('admin', 'CALL sp_monthly_revenue(?)', [year]),
      // nested subquery
      query('admin', `SELECT member_id AS id, name, email FROM member
                      WHERE member_id NOT IN (SELECT member_id FROM attendance
                                              WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY))
                      ORDER BY name`),
      // view with joins and aggregates
      query('admin', `SELECT trainer_name AS trainer, total_members AS members,
                             upcoming_appointments AS upcoming
                      FROM v_trainer_workload ORDER BY total_members DESC`),
      // non-recursive CTE
      query('admin', `WITH visits AS (
                        SELECT member_id, COUNT(*) AS visit_count FROM attendance
                        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY member_id)
                      SELECT m.name, v.visit_count AS visits
                      FROM visits v JOIN member m ON m.member_id = v.member_id
                      ORDER BY v.visit_count DESC LIMIT 5`),
    ]);
    return NextResponse.json({ year, revenue: revenueResult[0], inactive, workload, top });
  } catch (err) {
    return dbError(err);
  }
}
