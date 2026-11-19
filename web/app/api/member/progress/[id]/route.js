import { NextResponse } from 'next/server';
import { getDb, toObjectId, mongoError } from '@/lib/mongo';
import { requireRole } from '@/lib/session';

export async function DELETE(request, { params }) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    const db = await getDb();
    const r = await db.collection('body_progress').deleteOne({ _id, member_id: session.id });
    if (r.deletedCount === 0) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return mongoError(err);
  }
}
