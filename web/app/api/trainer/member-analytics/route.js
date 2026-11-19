import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { getDb, mongoError } from '@/lib/mongo';
import { getAnalytics } from '@/lib/analytics';
import { requireRole, dbError } from '@/lib/session';

export async function GET(request) {
  const { session, error } = await requireRole(request, 'trainer');
  if (error) return error;
  const memberId = Number(new URL(request.url).searchParams.get('memberId'));
  if (!Number.isInteger(memberId) || memberId < 1) return NextResponse.json({ error: 'Invalid member' }, { status: 400 });
  try {
    // MySQL decides who this trainer may see; MongoDB only holds the data
    const own = await query('trainer', 'SELECT member_id FROM v_member_public WHERE member_id = ? AND trainer_id = ?', [memberId, session.id]);
    if (own.length === 0) return NextResponse.json({ error: 'This member is not assigned to you' }, { status: 403 });
  } catch (err) {
    return dbError(err);
  }
  try {
    const db = await getDb();
    const analytics = await getAnalytics(db, memberId);
    const logs = await db.collection('workout_logs').find({ member_id: memberId }).sort({ date: -1 }).limit(5).toArray();
    return NextResponse.json({ ...analytics, logs });
  } catch (err) {
    return mongoError(err);
  }
}
