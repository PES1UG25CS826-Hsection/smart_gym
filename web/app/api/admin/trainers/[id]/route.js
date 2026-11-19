import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function DELETE(request, { params }) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    // members keep existing (trainer_id becomes NULL); appointments/plans block the delete
    const r = await query('admin', 'DELETE FROM trainer WHERE trainer_id = ?', [id]);
    if (r.affectedRows === 0) return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err.errno === 1451) return NextResponse.json({ error: 'This trainer has appointments or workout plans and cannot be deleted' }, { status: 409 });
    return dbError(err);
  }
}
