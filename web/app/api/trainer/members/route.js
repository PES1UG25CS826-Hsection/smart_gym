import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function GET(request) {
  const { session, error } = await requireRole(request, 'trainer');
  if (error) return error;
  try {
    const members = await query(
      'trainer',
      `SELECT m.member_id AS id, m.name, m.email, m.phone,
              v.type AS membership, v.end_date AS expires, v.days_left
       FROM v_member_public m
       LEFT JOIN v_active_memberships v ON v.member_id = m.member_id
       WHERE m.trainer_id = ?
       ORDER BY m.name`,
      [session.id]
    );
    return NextResponse.json({ members });
  } catch (err) {
    return dbError(err);
  }
}
