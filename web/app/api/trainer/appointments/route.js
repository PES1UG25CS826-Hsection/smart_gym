import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function GET(request) {
  const { session, error } = await requireRole(request, 'trainer');
  if (error) return error;
  try {
    const appointments = await query(
      'trainer',
      `SELECT a.appointment_id AS id, a.date, a.start_time AS start, a.end_time AS end,
              a.status, m.name AS member
       FROM appointment a
       JOIN v_member_public m ON m.member_id = a.member_id
       WHERE a.trainer_id = ? AND a.date >= CURDATE()
       ORDER BY a.date, a.start_time`,
      [session.id]
    );
    return NextResponse.json({ appointments });
  } catch (err) {
    return dbError(err);
  }
}
