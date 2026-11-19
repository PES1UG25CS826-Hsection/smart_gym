import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function GET(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  try {
    const rows = await query('member', 'CALL sp_member_memberships(?)', [session.id]);
    return NextResponse.json({ memberships: rows[0] });
  } catch (err) {
    return dbError(err);
  }
}
