const unwind = [{ $unwind: '$exercises' }, { $unwind: '$exercises.sets' }];
const volume = { $multiply: ['$exercises.sets.reps', '$exercises.sets.weight_kg'] };
const r1 = (n) => Math.round(n * 10) / 10;

// MongoDB aggregation pipelines for one member
export async function getAnalytics(db, memberId) {
  const logs = db.collection('workout_logs');
  const [weekly, muscles, prs, body] = await Promise.all([
    logs.aggregate([
      { $match: { member_id: memberId } }, ...unwind,
      { $group: { _id: { year: { $isoWeekYear: '$date' }, week: { $isoWeek: '$date' } },
          volume: { $sum: volume }, sets: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]).toArray(),
    logs.aggregate([
      { $match: { member_id: memberId } }, ...unwind,
      { $group: { _id: '$exercises.muscle_group', volume: { $sum: volume }, sets: { $sum: 1 } } },
      { $sort: { volume: -1 } },
    ]).toArray(),
    logs.aggregate([
      { $match: { member_id: memberId } }, ...unwind,
      { $group: { _id: '$exercises.name', max_weight: { $max: '$exercises.sets.weight_kg' } } },
      { $sort: { max_weight: -1 } }, { $limit: 10 },
    ]).toArray(),
    db.collection('body_progress').aggregate([
      { $match: { member_id: memberId } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          avg_weight: { $avg: '$weight_kg' }, avg_fat: { $avg: '$body_fat_pct' } } },
      { $sort: { _id: 1 } },
    ]).toArray(),
  ]);
  return {
    weekly: weekly.map((w) => ({ label: `${w._id.year}-W${String(w._id.week).padStart(2, '0')}`, volume: w.volume, sets: w.sets })),
    muscles: muscles.map((m) => ({ muscle: m._id, volume: m.volume, sets: m.sets })),
    prs: prs.map((p) => ({ exercise: p._id, max_weight: p.max_weight })),
    body: body.map((b) => ({ month: b._id, avg_weight: r1(b.avg_weight), avg_fat: b.avg_fat == null ? null : r1(b.avg_fat) })),
  };
}
