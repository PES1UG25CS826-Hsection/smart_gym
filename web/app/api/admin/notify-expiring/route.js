import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { getDb, mongoError } from '@/lib/mongo';
import { requireRole, dbError } from '@/lib/session';

// SQL finds memberships expiring within 7 days; MongoDB stores one unread reminder per member
export async function POST(request) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  try {
    const rows = await query('admin',
      'SELECT member_id, MIN(days_left) AS days_left FROM v_active_memberships WHERE days_left BETWEEN 0 AND 7 GROUP BY member_id');
    const db = await getDb();
    let created = 0;
    for (const r of rows) {
      const res = await db.collection('activity_notifications').updateOne(
        { member_id: r.member_id, type: 'membership_expiring', read: false },
        { $setOnInsert: { message: `Your membership expires in ${r.days_left} day(s). Renew to keep training!`, created_at: new Date() } },
        { upsert: true });
      if (res.upsertedCount) created++;
    }
    return NextResponse.json({ ok: true, checked: rows.length, created });
  } catch (err) {
    return err.errno ? dbError(err) : mongoError(err);
  }
}
