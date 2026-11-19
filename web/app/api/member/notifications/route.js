import { NextResponse } from 'next/server';
import { getDb, mongoError } from '@/lib/mongo';
import { requireRole } from '@/lib/session';

export async function GET(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  try {
    const db = await getDb();
    const notifications = await db.collection('activity_notifications')
      .find({ member_id: session.id }).sort({ created_at: -1 }).limit(10).toArray();
    return NextResponse.json({ notifications });
  } catch (err) {
    return mongoError(err);
  }
}

export async function PATCH(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  try {
    const db = await getDb();
    await db.collection('activity_notifications').updateMany({ member_id: session.id, read: false }, { $set: { read: true } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return mongoError(err);
  }
}
