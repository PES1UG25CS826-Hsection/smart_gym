'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import AnalyticsPanel from '@/components/AnalyticsPanel';

const today = () => new Date().toISOString().slice(0, 10);
const input = 'rounded-md border border-gray-300 px-3 py-2 text-sm';

// "8x60, 8x62.5" -> [{reps:8, weight_kg:60}, {reps:8, weight_kg:62.5}]
function parseSets(text) {
  const sets = [];
  for (const part of text.split(',').map((p) => p.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)\s*[xX*]\s*(\d+(?:\.\d+)?)$/);
    if (!m) return null;
    sets.push({ reps: Number(m[1]), weight_kg: Number(m[2]) });
  }
  return sets.length ? sets : null;
}

export default function WorkoutsPage() {
  const [v, setV] = useState(0);
  const ex = useFetch('/api/member/exercises');
  const logs = useFetch(`/api/member/workouts?v=${v}`);
  const stats = useFetch(`/api/member/analytics?v=${v}`);
  const [form, setForm] = useState({ date: today(), duration_min: 60, notes: '' });
  const [rows, setRows] = useState([{ exercise_id: '', sets: '' }]);
  const [msg, setMsg] = useState(null);

  const setRow = (i, patch) => setRows(rows.map((r, k) => (k === i ? { ...r, ...patch } : r)));

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    const exercises = [];
    for (const [i, r] of rows.entries()) {
      const sets = parseSets(r.sets);
      if (!r.exercise_id || !sets) {
        return setMsg({ ok: false, text: `Exercise ${i + 1}: pick an exercise and enter sets like 8x60, 8x62.5` });
      }
      exercises.push({ exercise_id: Number(r.exercise_id), sets });
    }
    const res = await fetch('/api/member/workouts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, exercises }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg({ ok: true, text: 'Workout saved' });
      setRows([{ exercise_id: '', sets: '' }]);
      setForm({ ...form, notes: '' });
      setV((n) => n + 1);
    } else setMsg({ ok: false, text: body.error || 'Could not save' });
  }

  async function editNote(l) {
    const text = window.prompt('Update note', l.notes || '');
    if (text === null) return;
    await fetch(`/api/member/workouts/${l._id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: text }),
    });
    setV((n) => n + 1);
  }

  async function remove(l) {
    if (!window.confirm('Delete this workout?')) return;
    await fetch(`/api/member/workouts/${l._id}`, { method: 'DELETE' });
    setV((n) => n + 1);
  }

  const tableRows = (logs.data?.logs ?? []).map((l) => ({
    date: l.date.slice(0, 10),
    duration: `${l.duration_min} min`,
    exercises: l.exercises.map((e) => `${e.name} (${e.sets.map((s) => `${s.reps}x${s.weight_kg}`).join(', ')})`).join('; '),
    notes: l.notes || '-',
    actions: (
      <span className="space-x-3 whitespace-nowrap">
        <button onClick={() => editNote(l)} className="text-blue-700 underline">Edit note</button>
        <button onClick={() => remove(l)} className="text-red-600 underline">Delete</button>
      </span>
    ),
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Workout Log</h1>

      <form onSubmit={submit} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-medium">Log a workout</h2>
        <div className="flex flex-wrap gap-3">
          <input type="date" value={form.date} max={today()} onChange={(e) => setForm({ ...form, date: e.target.value })} className={input} required />
          <input type="number" min="1" max="600" value={form.duration_min} onChange={(e) => setForm({ ...form, duration_min: e.target.value })} className={`${input} w-28`} placeholder="Minutes" required />
          <input value={form.notes} maxLength={500} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${input} flex-1 min-w-48`} placeholder="Notes (optional)" />
        </div>
        {rows.map((r, i) => (
          <div key={i} className="flex flex-wrap gap-3">
            <select value={r.exercise_id} onChange={(e) => setRow(i, { exercise_id: e.target.value })} className={input}>
              <option value="">Choose exercise</option>
              {(ex.data?.exercises ?? []).map((x) => <option key={x.id} value={x.id}>{x.name} ({x.muscle_group})</option>)}
            </select>
            <input value={r.sets} onChange={(e) => setRow(i, { sets: e.target.value })} className={`${input} flex-1 min-w-64`} placeholder="Sets as reps x kg, e.g. 8x60, 8x62.5, 6x65" />
            {rows.length > 1 && <button type="button" onClick={() => setRows(rows.filter((_, k) => k !== i))} className="text-sm text-red-600">Remove</button>}
          </div>
        ))}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setRows([...rows, { exercise_id: '', sets: '' }])} className="text-sm text-blue-700 underline">+ Add exercise</button>
          <button className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">Save workout</button>
          {msg && <span className={msg.ok ? 'text-sm text-emerald-700' : 'text-sm text-red-600'}>{msg.text}</span>}
        </div>
      </form>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Recent workouts</h2>
        {logs.error && <p className="text-red-600">{logs.error}</p>}
        <DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'duration', label: 'Duration' }, { key: 'exercises', label: 'Exercises (reps x kg)' }, { key: 'notes', label: 'Notes' }, { key: 'actions', label: '' }]} rows={tableRows} />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Your analytics (MongoDB aggregation)</h2>
        {stats.error && <p className="text-red-600">{stats.error}</p>}
        {stats.data && <AnalyticsPanel data={stats.data} />}
      </section>
    </div>
  );
}
