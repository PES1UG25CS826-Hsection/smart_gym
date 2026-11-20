import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

const bad = (m, status = 400) => NextResponse.json({ error: m }, { status });

export async function GET(request) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const search = (new URL(request.url).searchParams.get('search') || '').trim();
  const like = `%${search}%`;
  try {
    const members = await query(
      'admin',
      `SELECT m.member_id AS id, m.name, m.email, m.phone, m.trainer_id, t.name AS trainer,
              v.type AS membership, v.end_date AS expires, v.days_left
       FROM member m
       LEFT JOIN trainer t ON t.trainer_id = m.trainer_id
       LEFT JOIN v_active_memberships v ON v.member_id = m.member_id
       WHERE m.name LIKE ? OR m.email LIKE ?
       ORDER BY m.name LIMIT 100`,
      [like, like]
    );
    return NextResponse.json({ members });
  } catch (err) {
    return dbError(err);
  }
}

export async function POST(request) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const b = await request.json().catch(() => null);
  if (!b) return bad('Invalid request');
  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim().toLowerCase();
  const phone = String(b.phone || '').trim();
  const address = String(b.address || '').trim();
  const trainerId = b.trainer_id === '' || b.trainer_id == null ? null : Number(b.trainer_id);
  if (!name || name.length > 100) return bad('Name is required (max 100 characters)');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return bad('Enter a valid email');
  if (phone && !/^\d{10,15}$/.test(phone)) return bad('Phone must be 10 to 15 digits');
  if (!['M', 'F', 'O'].includes(b.gender)) return bad('Choose a gender');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.dob || '')) return bad('Date of birth must be YYYY-MM-DD');
  if (trainerId !== null && (!Number.isInteger(trainerId) || trainerId < 1)) return bad('Invalid trainer');
  if (typeof b.password !== 'string' || b.password.length < 8) return bad('Password must be at least 8 characters');
  try {
    const hash = await bcrypt.hash(b.password, 10);
    const r = await query('admin',
      'INSERT INTO member (name, email, password_hash, phone, gender, dob, address, trainer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hash, phone || null, b.gender, b.dob, address || null, trainerId]);
    return NextResponse.json({ ok: true, id: r.insertId }, { status: 201 });
  } catch (err) {
    if (err.errno === 1062) return bad('A member with this email already exists', 409);
    if (err.errno === 3819) return bad('Please check the phone number and email format');
    if (err.errno === 1452) return bad('Trainer not found');
    return dbError(err); // rule violations from the database are shown as their message
  }
}
