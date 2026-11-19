import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

const bad = (m, status = 400) => NextResponse.json({ error: m }, { status });

export async function GET(request) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const search = (new URL(request.url).searchParams.get('search') || '').trim().slice(0, 100);
  const cols = 'exercise_id AS id, name, muscle_group, description';
  try {
    if (!search) return NextResponse.json({ exercises: await query('admin', `SELECT ${cols} FROM exercise ORDER BY muscle_group, name`), mode: 'all' });
    // FULLTEXT index ft_exercise(name, description); fall back to LIKE for very short or unmatched words
    let rows = await query('admin',
      `SELECT ${cols}, MATCH(name, description) AGAINST (? IN NATURAL LANGUAGE MODE) AS score
       FROM exercise WHERE MATCH(name, description) AGAINST (? IN NATURAL LANGUAGE MODE) ORDER BY score DESC`, [search, search]);
    let mode = 'fulltext';
    if (rows.length === 0) {
      rows = await query('admin', `SELECT ${cols} FROM exercise WHERE name LIKE ? OR muscle_group LIKE ? OR description LIKE ? ORDER BY name`, Array(3).fill(`%${search}%`));
      mode = 'like';
    }
    return NextResponse.json({ exercises: rows, mode });
  } catch (err) {
    return dbError(err);
  }
}

export async function POST(request) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const b = await request.json().catch(() => null);
  const name = String(b?.name || '').trim();
  const group = String(b?.muscle_group || '').trim();
  if (!name || name.length > 100 || !group || group.length > 100) return bad('Name and muscle group are required (max 100 characters)');
  try {
    const r = await query('admin', 'INSERT INTO exercise (name, muscle_group, description) VALUES (?, ?, ?)', [name, group, String(b.description || '').trim() || null]);
    return NextResponse.json({ ok: true, id: r.insertId }, { status: 201 });
  } catch (err) {
    if (err.errno === 1062) return bad('An exercise with this name already exists', 409);
    return dbError(err);
  }
}
