import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function GET(request) {
  const { error } = await requireRole(request, 'trainer');
  if (error) return error;
  try {
    const exercises = await query('trainer', 'SELECT exercise_id AS id, name, muscle_group FROM exercise ORDER BY muscle_group, name');
    return NextResponse.json({ exercises });
  } catch (err) {
    return dbError(err);
  }
}
