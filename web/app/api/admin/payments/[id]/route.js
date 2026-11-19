import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function PATCH(request, { params }) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const id = Number((await params).id);
  const b = await request.json().catch(() => null);
  if (!Number.isInteger(id) || !['Success', 'Pending', 'Failed'].includes(b?.status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  try {
    const r = await query('admin', 'UPDATE payment SET status = ? WHERE payment_id = ?', [b.status, id]);
    if (r.affectedRows === 0) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return dbError(err);
  }
}
