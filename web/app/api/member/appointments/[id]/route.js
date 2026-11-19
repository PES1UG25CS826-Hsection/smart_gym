import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function DELETE(request, { params }) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    await query('member', 'CALL sp_cancel_appointment(?, ?)', [session.id, id]);
    return NextResponse.json({ ok: true, message: 'Appointment cancelled' });
  } catch (err) {
    return dbError(err);
  }
}
