import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function PATCH(request, { params }) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const id = Number((await params).id);
  const b = await request.json().catch(() => null);
  if (!Number.isInteger(id) || typeof b?.description !== 'string') return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  try {
    const r = await query('admin', 'UPDATE exercise SET description = ? WHERE exercise_id = ?', [b.description.trim() || null, id]);
    if (r.affectedRows === 0) return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return dbError(err);
  }
}

export async function DELETE(request, { params }) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    const r = await query('admin', 'DELETE FROM exercise WHERE exercise_id = ?', [id]);
    if (r.affectedRows === 0) return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err.errno === 1451) return NextResponse.json({ error: 'This exercise is used in a workout plan and cannot be deleted' }, { status: 409 });
    return dbError(err);
  }
}
