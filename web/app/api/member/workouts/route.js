import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { getDb, mongoError } from '@/lib/mongo';
import { parseWorkout } from '@/lib/validate';
import { requireRole } from '@/lib/session';

const bad = (msg) => NextResponse.json({ error: msg }, { status: 400 });

export async function GET(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  try {
    const db = await getDb();
    const logs = await db.collection('workout_logs').find({ member_id: session.id }).sort({ date: -1 }).limit(20).toArray();
    return NextResponse.json({ logs });
  } catch (err) {
    return mongoError(err);
  }
}

export async function POST(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  const body = await request.json().catch(() => null);
  if (!body) return bad('Invalid request');
  const { errors, value } = parseWorkout(body);
  if (errors.length) return bad(errors.join('; '));
  try {
    // Exercise names and muscle groups come from MySQL, never from the browser
    const ids = [...new Set(value.exercises.map((e) => e.exercise_id))];
    const rows = await query('member', 'SELECT exercise_id, name, muscle_group FROM exercise WHERE exercise_id IN (?)', [ids]);
    const byId = Object.fromEntries(rows.map((r) => [r.exercise_id, r]));
    if (ids.some((id) => !byId[id])) return bad('Unknown exercise selected');

    const doc = {
      member_id: session.id,
      date: value.date,
      duration_min: value.duration_min,
      exercises: value.exercises.map((e) => ({
        exercise_id: e.exercise_id, name: byId[e.exercise_id].name,
        muscle_group: byId[e.exercise_id].muscle_group, sets: e.sets,
      })),
    };
    if (value.notes) doc.notes = value.notes;
    const db = await getDb();
    const r = await db.collection('workout_logs').insertOne(doc);
    return NextResponse.json({ ok: true, id: r.insertedId }, { status: 201 });
  } catch (err) {
    return mongoError(err);
  }
}
