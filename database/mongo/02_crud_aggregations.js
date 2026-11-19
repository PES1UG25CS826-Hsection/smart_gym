// Run these in mongosh one block at a time (they change data) and take screenshots.
db = db.getSiblingDB('smart_gym_nosql');

// ---------- Validation demo: this insert is REJECTED by the database ----------
db.workout_logs.insertOne({ member_id: 1, date: new Date(), exercises: [
  { exercise_id: 1, name: 'Barbell Squat', muscle_group: 'Legs', sets: [ { reps: 0, weight_kg: 50 } ] } ] });

// ---------- CREATE ----------
db.body_progress.insertOne({ member_id: 3, date: new Date(), weight_kg: 82.4, body_fat_pct: 21.5, measurements: { waist_cm: 90 } });

// ---------- READ ----------
db.workout_logs.find({ member_id: 1 }).sort({ date: -1 }).limit(5);
db.workout_logs.find({ $text: { $search: 'shoulder pain' } });
db.activity_notifications.find({ member_id: 1, read: false });

// ---------- UPDATE ----------
const last = db.workout_logs.find({ member_id: 1 }).sort({ date: -1 }).limit(1).toArray()[0];
db.workout_logs.updateOne({ _id: last._id, 'exercises.exercise_id': 2 },
  { $push: { 'exercises.$.sets': { reps: 6, weight_kg: 70 } } });
db.workout_logs.updateOne({ _id: last._id }, { $set: { notes: 'Updated note' } });
db.activity_notifications.updateMany({ member_id: 1 }, { $set: { read: true } });

// ---------- DELETE ----------
db.body_progress.deleteOne({ member_id: 3 });
db.activity_notifications.deleteMany({ read: true });

// ---------- AGGREGATION 1: weekly training volume ----------
db.workout_logs.aggregate([
  { $match: { member_id: 1 } }, { $unwind: '$exercises' }, { $unwind: '$exercises.sets' },
  { $group: { _id: { year: { $isoWeekYear: '$date' }, week: { $isoWeek: '$date' } },
      volume_kg: { $sum: { $multiply: ['$exercises.sets.reps', '$exercises.sets.weight_kg'] } }, sets: { $sum: 1 } } },
  { $sort: { '_id.year': 1, '_id.week': 1 } }
]);

// ---------- AGGREGATION 2: volume by muscle group ----------
db.workout_logs.aggregate([
  { $match: { member_id: 1 } }, { $unwind: '$exercises' }, { $unwind: '$exercises.sets' },
  { $group: { _id: '$exercises.muscle_group',
      volume_kg: { $sum: { $multiply: ['$exercises.sets.reps', '$exercises.sets.weight_kg'] } } } },
  { $sort: { volume_kg: -1 } }
]);

// ---------- AGGREGATION 3: personal records ----------
db.workout_logs.aggregate([
  { $match: { member_id: 1 } }, { $unwind: '$exercises' }, { $unwind: '$exercises.sets' },
  { $group: { _id: '$exercises.name', max_weight_kg: { $max: '$exercises.sets.weight_kg' } } },
  { $sort: { max_weight_kg: -1 } }
]);

// ---------- AGGREGATION 4: monthly body trend ----------
db.body_progress.aggregate([
  { $match: { member_id: 1 } },
  { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
      avg_weight_kg: { $avg: '$weight_kg' }, avg_body_fat: { $avg: '$body_fat_pct' } } },
  { $sort: { _id: 1 } }
]);

// ---------- AGGREGATION 5: most popular exercises in the gym ----------
db.workout_logs.aggregate([
  { $unwind: '$exercises' },
  { $group: { _id: '$exercises.name', times_logged: { $sum: 1 } } },
  { $sort: { times_logged: -1 } }, { $limit: 5 }
]);

// ---------- Index check ----------
db.workout_logs.find({ member_id: 1 }).sort({ date: -1 }).explain('executionStats').executionStats;
