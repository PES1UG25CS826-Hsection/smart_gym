import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function GET(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  try {
    // A CALL returns [resultSetRows, statusPacket]; the member's DB role can only EXECUTE procedures
    const rows = await query('member', 'CALL sp_member_dashboard(?)', [session.id]);
    return NextResponse.json({ summary: rows[0]?.[0] ?? null });
  } catch (err) {
    return dbError(err);
  }
}
