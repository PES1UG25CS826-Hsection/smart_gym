import { NextResponse } from 'next/server';
import { getDb, mongoError } from '@/lib/mongo';
import { getAnalytics } from '@/lib/analytics';
import { requireRole } from '@/lib/session';

export async function GET(request) {
  const { session, error } = await requireRole(request, 'member');
  if (error) return error;
  try {
    return NextResponse.json(await getAnalytics(await getDb(), session.id));
  } catch (err) {
    return mongoError(err);
  }
}
