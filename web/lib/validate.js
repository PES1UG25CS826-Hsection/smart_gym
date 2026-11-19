export function parseDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseWorkout(body) {
  const errors = [];
  const date = parseDate(body.date);
  if (!date) errors.push('Date must be YYYY-MM-DD');
  const duration = Number(body.duration_min);
  if (!(duration >= 1 && duration <= 600)) errors.push('Duration must be 1 to 600 minutes');
  const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 500) : '';
  const exercises = [];
  if (!Array.isArray(body.exercises) || body.exercises.length < 1 || body.exercises.length > 20) {
    errors.push('Add 1 to 20 exercises');
  } else {
    body.exercises.forEach((e, i) => {
      const id = Number(e?.exercise_id);
      if (!Number.isInteger(id) || id < 1) errors.push(`Exercise ${i + 1}: choose an exercise`);
      const sets = [];
      if (!Array.isArray(e?.sets) || e.sets.length < 1 || e.sets.length > 20) {
        errors.push(`Exercise ${i + 1}: enter 1 to 20 sets`);
      } else {
        e.sets.forEach((s, j) => {
          const reps = Number(s.reps);
          const kg = Number(s.weight_kg);
          if (!Number.isInteger(reps) || reps < 1 || reps > 100) errors.push(`Exercise ${i + 1}, set ${j + 1}: reps must be 1 to 100`);
          else if (!(kg >= 0 && kg <= 1000)) errors.push(`Exercise ${i + 1}, set ${j + 1}: weight must be 0 to 1000 kg`);
          else sets.push({ reps, weight_kg: kg });
        });
      }
      exercises.push({ exercise_id: id, sets });
    });
  }
  return { errors, value: { date, duration_min: duration, notes, exercises } };
}

function optional(v, lo, hi, label, errors) {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  if (!(n >= lo && n <= hi)) { errors.push(`${label} must be ${lo} to ${hi}`); return undefined; }
  return n;
}

export function parseProgress(body) {
  const errors = [];
  const date = parseDate(body.date);
  if (!date) errors.push('Date must be YYYY-MM-DD');
  const weight = Number(body.weight_kg);
  if (!(weight >= 20 && weight <= 300)) errors.push('Weight must be 20 to 300 kg');
  const fat = optional(body.body_fat_pct, 1, 70, 'Body fat %', errors);
  const chest = optional(body.chest_cm, 20, 300, 'Chest', errors);
  const waist = optional(body.waist_cm, 20, 300, 'Waist', errors);
  const set = { weight_kg: weight };
  if (fat !== undefined) set.body_fat_pct = fat;
  const m = {};
  if (chest !== undefined) m.chest_cm = chest;
  if (waist !== undefined) m.waist_cm = waist;
  if (Object.keys(m).length) set.measurements = m;
  return { errors, date, set };
}
