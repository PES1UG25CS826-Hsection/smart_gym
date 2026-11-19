import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { requireRole, dbError } from '@/lib/session';

export async function GET(request) {
  const { error } = await requireRole(request, 'member');
  if (error) return error;
  const search = (new URL(request.url).searchParams.get('search') || '').trim().slice(0, 100);
  try {
    const rows = await query('member', 'CALL sp_list_trainers(?)', [search]);
    return NextResponse.json({ trainers: rows[0] });
  } catch (err) {
    return dbError(err);
  }
}
