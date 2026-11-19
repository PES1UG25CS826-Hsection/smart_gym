import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function POST(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  try {
    // The trigger trg_attendance_membership rejects this if the membership is not active
    await query('member', 'CALL sp_check_in(?)', [session.id]);
    return NextResponse.json({ ok: true, message: 'Checked in. Have a great workout!' });
  } catch (err) {
    return dbError(err);
  }
}
