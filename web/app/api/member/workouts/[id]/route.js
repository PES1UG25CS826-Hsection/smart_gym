import { NextResponse } from 'next/server';
import { getDb, toObjectId, mongoError } from '@/lib/mongo';
import { requireRole } from '@/lib/session';

export async function PATCH(request, { params }) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  const { id } = await params;
  const _id = toObjectId(id);
  const body = await request.json().catch(() => null);
  if (!_id || !body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const set = {};
  if (typeof body.notes === 'string') set.notes = body.notes.trim().slice(0, 500);
  if (body.duration_min !== undefined) {
    const d = Number(body.duration_min);
    if (!(d >= 1 && d <= 600)) return NextResponse.json({ error: 'Duration must be 1 to 600 minutes' }, { status: 400 });
    set.duration_min = d;
  }
  if (Object.keys(set).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  try {
    const db = await getDb();
    // member_id in the filter means members can only change their own logs
    const r = await db.collection('workout_logs').updateOne({ _id, member_id: session.id }, { $set: set });
    if (r.matchedCount === 0) return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return mongoError(err);
  }
}

export async function DELETE(request, { params }) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  const { id } = await params;
  const _id = toObjectId(id);
  if (!_id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    const db = await getDb();
    const r = await db.collection('workout_logs').deleteOne({ _id, member_id: session.id });
    if (r.deletedCount === 0) return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return mongoError(err);
  }
}
