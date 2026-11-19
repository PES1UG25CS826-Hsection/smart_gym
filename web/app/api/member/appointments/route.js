import { NextResponse } from 'next/server';
import { query, getPool } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function GET(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  try {
    const rows = await query('member', 'CALL sp_member_appointments(?)', [session.id]);
    return NextResponse.json({ appointments: rows[0] });
  } catch (err) {
    return dbError(err);
  }
}

export async function POST(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  const b = await request.json().catch(() => null);
  const trainerId = Number(b?.trainer_id);
  const today = new Date().toISOString().slice(0, 10);
  const okDate = typeof b?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.date) && b.date >= today;
  const okTime = (t) => typeof t === 'string' && /^\d{2}:\d{2}$/.test(t);
  if (!Number.isInteger(trainerId) || trainerId < 1 || !okDate || !okTime(b?.start) || !okTime(b?.end) || b.end <= b.start) {
    return NextResponse.json({ error: 'Choose a trainer, a date from today onwards, and an end time after the start time' }, { status: 400 });
  }
  const conn = await getPool('member').getConnection();
  try {
    // Procedure checks the membership; trigger blocks overlapping slots for the trainer
    await conn.query('CALL sp_book_appointment(?, ?, ?, ?, ?, @appt_id)',
      [session.id, trainerId, b.date, `${b.start}:00`, `${b.end}:00`]);
    const [[row]] = await conn.query('SELECT @appt_id AS id');
    return NextResponse.json({ ok: true, appointment_id: row.id, message: 'Appointment booked' }, { status: 201 });
  } catch (err) {
    if (err.errno === 1452) return NextResponse.json({ error: 'Trainer not found' }, { status: 400 });
    return dbError(err);
  } finally {
    conn.release();
  }
}
