import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function GET(request) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  const d = new URL(request.url).searchParams.get('date') || '';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  try {
    const rows = await query('admin',
      `SELECT a.attendance_id AS id, m.name AS member, a.date, a.check_in, a.check_out, a.status
       FROM attendance a JOIN member m ON m.member_id = a.member_id
       WHERE a.date = COALESCE(?, CURDATE()) ORDER BY a.check_in`, [date]);
    return NextResponse.json({ attendance: rows });
  } catch (err) {
    return dbError(err);
  }
}
