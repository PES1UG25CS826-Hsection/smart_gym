import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function GET(request) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const status = new URL(request.url).searchParams.get('status') || '';
  const filter = ['Success', 'Pending', 'Failed'].includes(status) ? status : '';
  try {
    const [payments, byMethod, aboveAvg] = await Promise.all([
      query('admin',
        `SELECT p.payment_id AS id, m.name AS member, ms.type AS plan, p.amount, p.payment_method AS method,
                p.status, p.payment_date AS date, p.reference_no AS reference
         FROM payment p JOIN membership ms ON ms.membership_id = p.membership_id
         JOIN member m ON m.member_id = ms.member_id
         WHERE (? = '' OR p.status = ?) ORDER BY p.payment_date DESC LIMIT 100`, [filter, filter]),
      // GROUP BY with aggregates
      query('admin',
        `SELECT payment_method AS method, COUNT(*) AS payments, SUM(amount) AS total
         FROM payment WHERE status = 'Success' GROUP BY payment_method ORDER BY total DESC`),
      // correlated subquery: payments above the same member's own average
      query('admin',
        `SELECT m.name AS member, p.amount, p.payment_date AS date
         FROM payment p JOIN membership ms ON ms.membership_id = p.membership_id
         JOIN member m ON m.member_id = ms.member_id
         WHERE p.amount > (SELECT AVG(p2.amount) FROM payment p2
                           JOIN membership ms2 ON ms2.membership_id = p2.membership_id
                           WHERE ms2.member_id = ms.member_id)
         ORDER BY p.amount DESC`),
    ]);
    return NextResponse.json({ payments, byMethod, aboveAvg });
  } catch (err) {
    return dbError(err);
  }
}
