import { NextResponse } from 'next/server';
import { getDb, mongoError } from '@/lib/mongo';
import { requireRole } from '@/lib/session';

export async function GET(request) {
  const { error } = await requireRole(request, 'admin');
  if (error) return error;
  try {
    const db = await getDb();
    const [popular, logs, progress, notifications] = await Promise.all([
      db.collection('workout_logs').aggregate([
        { $unwind: '$exercises' },
        { $group: { _id: '$exercises.name', times_logged: { $sum: 1 } } },
        { $sort: { times_logged: -1 } }, { $limit: 5 },
      ]).toArray(),
      db.collection('workout_logs').countDocuments(),
      db.collection('body_progress').countDocuments(),
      db.collection('activity_notifications').countDocuments(),
    ]);
    return NextResponse.json({
      popular: popular.map((p) => ({ exercise: p._id, times: p.times_logged })),
      totals: [{ collection: 'workout_logs', documents: logs }, { collection: 'body_progress', documents: progress }, { collection: 'activity_notifications', documents: notifications }],
    });
  } catch (err) {
    return mongoError(err);
  }
}
