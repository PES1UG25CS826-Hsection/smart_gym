import { NextResponse } from 'next/server';
import { getDb, mongoError } from '@/lib/mongo';
import { parseProgress } from '@/lib/validate';
import { requireRole } from '@/lib/session';

export async function GET(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  try {
    const db = await getDb();
    const entries = await db.collection('body_progress').find({ member_id: session.id }).sort({ date: -1 }).limit(30).toArray();
    return NextResponse.json({ entries });
  } catch (err) {
    return mongoError(err);
  }
}

// One entry per member per day: posting the same date again updates it (upsert)
export async function POST(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const { errors, date, set } = parseProgress(body);
  if (errors.length) return NextResponse.json({ error: errors.join('; ') }, { status: 400 });
  try {
    const db = await getDb();
    await db.collection('body_progress').updateOne({ member_id: session.id, date }, { $set: set }, { upsert: true });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return mongoError(err);
  }
}
