// Run: mongosh "mongodb://127.0.0.1:27017" --file 01_setup.js
db = db.getSiblingDB('smart_gym_nosql');

// Start clean so the script can be re-run
['workout_logs', 'body_progress', 'activity_notifications'].forEach((n) => db.getCollection(n).drop());

// ---------- Collections with JSON-schema validation ----------
db.createCollection('workout_logs', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['member_id', 'date', 'exercises'],
    properties: {
      member_id:    { bsonType: 'number', minimum: 1 },      // MySQL member.member_id
      plan_id:      { bsonType: ['number', 'null'] },        // MySQL workout_plan.plan_id
      date:         { bsonType: 'date' },
      duration_min: { bsonType: 'number', minimum: 1, maximum: 600 },
      notes:        { bsonType: 'string', maxLength: 500 },
      exercises: {
        bsonType: 'array', minItems: 1,
        items: {
          bsonType: 'object',
          required: ['exercise_id', 'name', 'muscle_group', 'sets'],
          properties: {
            exercise_id:  { bsonType: 'number' },            // MySQL exercise.exercise_id
            name:         { bsonType: 'string' },
            muscle_group: { bsonType: 'string' },
            sets: {
              bsonType: 'array', minItems: 1,
              items: {
                bsonType: 'object',
                required: ['reps', 'weight_kg'],
                properties: {
                  reps:      { bsonType: 'number', minimum: 1, maximum: 100 },
                  weight_kg: { bsonType: 'number', minimum: 0, maximum: 1000 },
                  rpe:       { bsonType: 'number', minimum: 1, maximum: 10 }
                }
              }
            }
          }
        }
      }
    }
  } },
  validationLevel: 'strict', validationAction: 'error'
});

db.createCollection('body_progress', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['member_id', 'date', 'weight_kg'],
    properties: {
      member_id:    { bsonType: 'number', minimum: 1 },
      date:         { bsonType: 'date' },
      weight_kg:    { bsonType: 'number', minimum: 20, maximum: 300 },
      body_fat_pct: { bsonType: 'number', minimum: 1, maximum: 70 },
      measurements: { bsonType: 'object', properties: {
        chest_cm: { bsonType: 'number' }, waist_cm: { bsonType: 'number' } } }
    }
  } }
});

db.createCollection('activity_notifications', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['member_id', 'type', 'message', 'read', 'created_at'],
    properties: {
      member_id:  { bsonType: 'number' },
      type:       { enum: ['membership_expiring', 'payment_received', 'appointment_reminder', 'goal_achieved'] },
      message:    { bsonType: 'string' },
      read:       { bsonType: 'bool' },
      created_at: { bsonType: 'date' }
    }
  } }
});

// ---------- Indexes ----------
db.workout_logs.createIndex({ member_id: 1, date: -1 });
db.workout_logs.createIndex({ 'exercises.exercise_id': 1 });
db.workout_logs.createIndex({ notes: 'text' });
db.body_progress.createIndex({ member_id: 1, date: 1 }, { unique: true });
db.activity_notifications.createIndex({ member_id: 1, read: 1 });
db.activity_notifications.createIndex({ created_at: 1 }, { expireAfterSeconds: 2592000 }); // TTL 30 days

// ---------- Sample data (exercise ids match the MySQL exercise table) ----------
const DAY = 24 * 60 * 60 * 1000;
const day = (n) => { const d = new Date(Date.now() - n * DAY);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); };
const lift = (id, name, group, w) => ({ exercise_id: id, name, muscle_group: group,
  sets: [ { reps: 8, weight_kg: w }, { reps: 8, weight_kg: w + 5 }, { reps: 6, weight_kg: w + 10 } ] });
const squat = (w) => lift(1, 'Barbell Squat', 'Legs', w);
const bench = (w) => lift(2, 'Bench Press', 'Chest', w);
const dead  = (w) => lift(3, 'Deadlift', 'Back', w);
const press = (w) => lift(4, 'Overhead Press', 'Shoulders', w);

db.workout_logs.insertMany([
  { member_id: 1, date: day(1),  duration_min: 75, notes: 'Felt strong, slight shoulder pain on press', exercises: [squat(80), bench(60)] },
  { member_id: 1, date: day(4),  duration_min: 70, exercises: [dead(100), press(35)] },
  { member_id: 1, date: day(8),  duration_min: 65, exercises: [squat(77.5), bench(57.5)] },
  { member_id: 1, date: day(11), duration_min: 60, notes: 'Deadlift day', exercises: [dead(97.5)] },
  { member_id: 1, date: day(15), duration_min: 70, exercises: [squat(75), bench(55)] },
  { member_id: 1, date: day(18), duration_min: 65, exercises: [dead(95), press(32.5)] },
  { member_id: 1, date: day(22), duration_min: 60, exercises: [squat(72.5)] },
  { member_id: 2, date: day(2),  duration_min: 45, notes: 'Core and flexibility',
    exercises: [ { exercise_id: 5, name: 'Plank', muscle_group: 'Core', sets: [ { reps: 1, weight_kg: 0 }, { reps: 1, weight_kg: 0 } ] } ] }
]);

db.body_progress.insertMany([
  { member_id: 1, date: day(40), weight_kg: 74.0, body_fat_pct: 18.6, measurements: { chest_cm: 97, waist_cm: 83 } },
  { member_id: 1, date: day(20), weight_kg: 74.8, body_fat_pct: 18.0, measurements: { chest_cm: 99, waist_cm: 82 } },
  { member_id: 1, date: day(1),  weight_kg: 75.6, body_fat_pct: 17.4, measurements: { chest_cm: 100, waist_cm: 81 } }
]);

db.activity_notifications.insertMany([
  { member_id: 1, type: 'goal_achieved', message: 'New personal record on Barbell Squat!', read: false, created_at: new Date() },
  { member_id: 2, type: 'appointment_reminder', message: 'Flexibility session with your trainer is coming up', read: false, created_at: new Date() }
]);

print('workout_logs: ' + db.workout_logs.countDocuments());
print('body_progress: ' + db.body_progress.countDocuments());
print('activity_notifications: ' + db.activity_notifications.countDocuments());
