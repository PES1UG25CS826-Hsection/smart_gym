import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function POST(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  try {
    const result = await query('member', 'CALL sp_check_out(?)', [session.id]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'No open check-in found for today' }, { status: 400 });
    }
    return NextResponse.json({ ok: true, message: 'Checked out. See you next time!' });
  } catch (err) {
    return dbError(err);
  }
}
