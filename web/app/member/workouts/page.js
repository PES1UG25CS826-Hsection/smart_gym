'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import { PageHeader, Card, Notice, ErrorText, btnPrimary, fieldCls, linkAction, linkDanger } from '@/components/ui';

const today = () => new Date().toISOString().slice(0, 10);
const label = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500';

// "8x60, 8x62.5" becomes [{reps: 8, weight_kg: 60}, {reps: 8, weight_kg: 62.5}]
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
      if (!r.exercise_id || !sets) return setMsg({ ok: false, text: `Exercise ${i + 1}: pick an exercise and enter sets like 8x60, 8x62.5` });
      exercises.push({ exercise_id: Number(r.exercise_id), sets });
    }
    const res = await fetch('/api/member/workouts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, exercises }) });
    const body = await res.json().catch(() => ({}));
    if (res.ok) { setMsg({ ok: true, text: 'Workout saved' }); setRows([{ exercise_id: '', sets: '' }]); setForm({ ...form, notes: '' }); setV((n) => n + 1); }
    else setMsg({ ok: false, text: body.error || 'Could not save' });
  }
  async function editNote(l) {
    const text = window.prompt('Update note', l.notes || '');
    if (text === null) return;
    await fetch(`/api/member/workouts/${l._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: text }) });
    setV((n) => n + 1);
  }
  async function remove(l) {
    if (!window.confirm('Delete this workout?')) return;
    await fetch(`/api/member/workouts/${l._id}`, { method: 'DELETE' });
    setV((n) => n + 1);
  }

  const tableRows = (logs.data?.logs ?? []).map((l) => ({
    date: l.date.slice(0, 10), duration: `${l.duration_min} min`,
    exercises: l.exercises.map((e) => `${e.name} (${e.sets.map((s) => `${s.reps}x${s.weight_kg}`).join(', ')})`).join('; '),
    notes: l.notes || '-',
    actions: (<span className="space-x-4 whitespace-nowrap"><button onClick={() => editNote(l)} className={linkAction}>Edit note</button><button onClick={() => remove(l)} className={linkDanger}>Delete</button></span>),
  }));

  return (
    <div className="space-y-8">
      <PageHeader title="Workout log" subtitle="Record every session and watch your numbers climb." />
      <Card title="Log a workout">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className={label}>Date</label><input type="date" value={form.date} max={today()} onChange={(e) => setForm({ ...form, date: e.target.value })} className={fieldCls} required /></div>
            <div><label className={label}>Duration (minutes)</label><input type="number" min="1" max="600" value={form.duration_min} onChange={(e) => setForm({ ...form, duration_min: e.target.value })} className={fieldCls} required /></div>
            <div><label className={label}>Notes</label><input value={form.notes} maxLength={500} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={fieldCls} placeholder="Optional" /></div>
          </div>
          {rows.map((r, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
              <div>
                <label className={label}>Exercise {i + 1}</label>
                <select value={r.exercise_id} onChange={(e) => setRow(i, { exercise_id: e.target.value })} className={fieldCls}>
                  <option value="">Choose exercise</option>
                  {(ex.data?.exercises ?? []).map((x) => <option key={x.id} value={x.id}>{x.name} ({x.muscle_group})</option>)}
                </select>
              </div>
              <div><label className={label}>Sets (reps x kg)</label><input value={r.sets} onChange={(e) => setRow(i, { sets: e.target.value })} className={fieldCls} placeholder="8x60, 8x62.5, 6x65" /></div>
              {rows.length > 1 ? <button type="button" onClick={() => setRows(rows.filter((_, k) => k !== i))} className={`${linkDanger} pb-3`}>Remove</button> : <span />}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => setRows([...rows, { exercise_id: '', sets: '' }])} className={`${linkAction} inline-flex items-center gap-1`}><Plus size={16} /> Add exercise</button>
            <button className={btnPrimary}>Save workout</button>
          </div>
        </form>
      </Card>
      <Notice ok={msg?.ok}>{msg?.text}</Notice>
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Recent workouts</h2>
        <ErrorText>{logs.error}</ErrorText>
        <DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'duration', label: 'Duration' }, { key: 'exercises', label: 'Exercises (reps x kg)' }, { key: 'notes', label: 'Notes' }, { key: 'actions', label: '' }]} rows={tableRows} empty="No workouts logged yet" />
      </div>
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Your training insights</h2>
        <ErrorText>{stats.error}</ErrorText>
        {stats.data && <AnalyticsPanel data={stats.data} />}
      </div>
    </div>
  );
}
