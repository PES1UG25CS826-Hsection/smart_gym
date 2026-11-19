import { NextResponse } from 'next/server';
import { query, getPool } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const bad = (m) => NextResponse.json({ error: m }, { status: 400 });

async function ownsMember(trainerId, memberId) {
  const r = await query('trainer', 'SELECT member_id FROM v_member_public WHERE member_id = ? AND trainer_id = ?', [memberId, trainerId]);
  return r.length > 0;
}

export async function GET(request) {
  const { session, error } = await requireRole(request, 'trainer');
  if (error) return error;
  const memberId = Number(new URL(request.url).searchParams.get('memberId'));
  if (!Number.isInteger(memberId) || memberId < 1) return bad('Invalid member');
  try {
    if (!(await ownsMember(session.id, memberId))) return NextResponse.json({ error: 'This member is not assigned to you' }, { status: 403 });
    const rows = await query('trainer',
      `SELECT wp.plan_id, wp.goal, wp.start_date, wp.end_date, e.name AS exercise, pe.set_count, pe.reps, pe.notes
       FROM workout_plan wp
       LEFT JOIN plan_exercise pe ON pe.plan_id = wp.plan_id
       LEFT JOIN exercise e ON e.exercise_id = pe.exercise_id
       WHERE wp.member_id = ? AND wp.trainer_id = ?
       ORDER BY wp.start_date DESC, wp.plan_id DESC, e.name`, [memberId, session.id]);
    const plans = [];
    for (const r of rows) {
      let p = plans.find((x) => x.plan_id === r.plan_id);
      if (!p) { p = { plan_id: r.plan_id, goal: r.goal, start_date: r.start_date, end_date: r.end_date, exercises: [] }; plans.push(p); }
      if (r.exercise) p.exercises.push({ exercise: r.exercise, set_count: r.set_count, reps: r.reps, notes: r.notes });
    }
    return NextResponse.json({ plans });
  } catch (err) {
    return dbError(err);
  }
}

// Creates the plan and all its exercises in ONE transaction (all or nothing)
export async function POST(request) {
  const { session, error } = await requireRole(request, 'trainer');
  if (error) return error;
  const b = await request.json().catch(() => null);
  if (!b) return bad('Invalid request');
  const memberId = Number(b.member_id);
  const goal = typeof b.goal === 'string' ? b.goal.trim().slice(0, 255) : '';
  const description = typeof b.description === 'string' ? b.description.trim() : '';
  if (!Number.isInteger(memberId) || memberId < 1) return bad('Choose a member');
  if (!goal) return bad('Enter a goal');
  if (!isDate(b.start_date) || !isDate(b.end_date) || b.end_date < b.start_date) return bad('End date must be on or after the start date');
  if (!Array.isArray(b.exercises) || b.exercises.length < 1 || b.exercises.length > 15) return bad('Add 1 to 15 exercises');
  const exercises = [];
  for (const [i, e] of b.exercises.entries()) {
    const id = Number(e.exercise_id), sets = Number(e.set_count), reps = Number(e.reps);
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(sets) || sets < 1 || sets > 20 || !Number.isInteger(reps) || reps < 1 || reps > 100) {
      return bad(`Exercise ${i + 1}: choose an exercise, sets (1-20) and reps (1-100)`);
    }
    exercises.push({ id, sets, reps, notes: typeof e.notes === 'string' && e.notes.trim() ? e.notes.trim() : null });
  }
  try {
    if (!(await ownsMember(session.id, memberId))) return NextResponse.json({ error: 'This member is not assigned to you' }, { status: 403 });
  } catch (err) {
    return dbError(err);
  }
  const conn = await getPool('trainer').getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'INSERT INTO workout_plan (member_id, trainer_id, start_date, end_date, goal, description) VALUES (?, ?, ?, ?, ?, ?)',
      [memberId, session.id, b.start_date, b.end_date, goal, description || null]);
    for (const e of exercises) {
      await conn.query('INSERT INTO plan_exercise (plan_id, exercise_id, set_count, reps, notes) VALUES (?, ?, ?, ?, ?)',
        [r.insertId, e.id, e.sets, e.reps, e.notes]);
    }
    await conn.commit();
    return NextResponse.json({ ok: true, plan_id: r.insertId }, { status: 201 });
  } catch (err) {
    await conn.rollback();
    if (err.errno === 1062) return NextResponse.json({ error: 'The same exercise was added twice' }, { status: 409 });
    if (err.errno === 1452) return NextResponse.json({ error: 'Unknown exercise selected' }, { status: 400 });
    return dbError(err);
  } finally {
    conn.release();
  }
}
