import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

const bad = (m, status = 400) => NextResponse.json({ error: m }, { status });

export async function GET(request) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  try {
    const trainers = await query('admin',
      `SELECT t.trainer_id AS id, t.name, t.email, t.phone, t.specialization, t.hire_date, COUNT(m.member_id) AS members
       FROM trainer t LEFT JOIN member m ON m.trainer_id = t.trainer_id
       GROUP BY t.trainer_id, t.name, t.email, t.phone, t.specialization, t.hire_date
       ORDER BY t.name`);
    return NextResponse.json({ trainers });
  } catch (err) {
    return dbError(err);
  }
}

export async function POST(request) {
  const { session, error } = await requireRole(request, 'admin');
  if (error) return error;
  const b = await request.json().catch(() => null);
  if (!b) return bad('Invalid request');
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim().toLowerCase();
  const phone = String(b.phone || '').trim();
  const spec = String(b.specialization || '').trim().slice(0, 100);
  if (!name || name.length > 100) return bad('Name is required (max 100 characters)');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return bad('Enter a valid email');
  if (phone && !/^\d{10,15}$/.test(phone)) return bad('Phone must be 10 to 15 digits');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.hire_date || '')) return bad('Hire date must be YYYY-MM-DD');
  if (typeof b.password !== 'string' || b.password.length < 8) return bad('Password must be at least 8 characters');
  try {
    const hash = await bcrypt.hash(b.password, 10);
    const r = await query('admin',
      'INSERT INTO trainer (name, email, password_hash, phone, specialization, hire_date, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hash, phone || null, spec || null, b.hire_date, session.id]);
    return NextResponse.json({ ok: true, id: r.insertId }, { status: 201 });
  } catch (err) {
    if (err.errno === 1062) return bad('A trainer with this email already exists', 409);
    if (err.errno === 3819) return bad('Phone format rejected by the database');
    return dbError(err);
  }
}
