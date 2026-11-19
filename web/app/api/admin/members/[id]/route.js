import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

const bad = (m, status = 400) => NextResponse.json({ error: m }, { status });

export async function PATCH(request, { params }) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const id = Number((await params).id);
  const b = await request.json().catch(() => null);
  if (!Number.isInteger(id) || !b) return bad('Invalid request');
  const sets = [], vals = [];
  if ('trainer_id' in b) {
    const t = b.trainer_id === null || b.trainer_id === '' ? null : Number(b.trainer_id);
    if (t !== null && (!Number.isInteger(t) || t < 1)) return bad('Invalid trainer');
    sets.push('trainer_id = ?'); vals.push(t);
  }
  if ('phone' in b) {
    const p = String(b.phone || '').trim();
    if (p && !/^\d{10,15}$/.test(p)) return bad('Phone must be 10 to 15 digits');
    sets.push('phone = ?'); vals.push(p || null);
  }
  if ('address' in b) { sets.push('address = ?'); vals.push(String(b.address || '').trim().slice(0, 255) || null); }
  if (!sets.length) return bad('Nothing to update');
  try {
    const r = await query('admin', `UPDATE member SET ${sets.join(', ')} WHERE member_id = ?`, [...vals, id]);
    if (r.affectedRows === 0) return bad('Member not found', 404);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err.errno === 1452) return bad('Trainer not found');
    return dbError(err);
  }
}

export async function DELETE(request, { params }) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return bad('Invalid id');
  try {
    const r = await query('admin', 'DELETE FROM member WHERE member_id = ?', [id]);
    if (r.affectedRows === 0) return bad('Member not found', 404);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // ON DELETE RESTRICT: members with membership/payment history are protected
    if (err.errno === 1451) return bad('This member has membership or payment history and cannot be deleted', 409);
    return dbError(err);
  }
}
