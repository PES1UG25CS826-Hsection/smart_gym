import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function GET(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  try {
    const rows = (await query('member', 'CALL sp_member_plan(?)', [session.id]))[0];
    const plans = [];
    for (const r of rows) {
      let p = plans.find((x) => x.plan_id === r.plan_id);
      if (!p) {
        p = { plan_id: r.plan_id, goal: r.goal, start_date: r.start_date, end_date: r.end_date,
              description: r.description, trainer: r.trainer, exercises: [] };
        plans.push(p);
      }
      p.exercises.push({ exercise: r.exercise, muscle_group: r.muscle_group, set_count: r.set_count, reps: r.reps, notes: r.notes });
    }
    return NextResponse.json({ plans });
  } catch (err) {
    return dbError(err);
  }
}
