'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';

const today = () => new Date().toISOString().slice(0, 10);
const input = 'rounded-md border border-gray-300 px-3 py-2 text-sm';
const blank = () => ({ exercise_id: '', set_count: 3, reps: 10, notes: '' });

export default function TrainerPlans() {
  const [v, setV] = useState(0);
  const members = useFetch('/api/trainer/members');
  const exercises = useFetch('/api/trainer/exercises');
  const [memberId, setMemberId] = useState('');
  const plans = useFetch(memberId ? `/api/trainer/plans?memberId=${memberId}&v=${v}` : '/api/trainer/exercises');
  const [form, setForm] = useState({ goal: '', start_date: today(), end_date: today(), description: '' });
  const [rows, setRows] = useState([blank()]);
  const [msg, setMsg] = useState(null);

  const setRow = (i, patch) => setRows(rows.map((r, k) => (k === i ? { ...r, ...patch } : r)));

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    if (!memberId) return setMsg({ ok: false, text: 'Choose a member first' });
    const res = await fetch('/api/trainer/plans', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, member_id: Number(memberId), exercises: rows }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) { setMsg({ ok: true, text: `Plan #${body.plan_id} created` }); setRows([blank()]); setV((n) => n + 1); }
    else setMsg({ ok: false, text: body.error || 'Could not create plan' });
  }

  const existing = memberId && plans.data?.plans ? plans.data.plans : [];
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Workout Plans</h1>
      <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={input}>
        <option value="">Choose one of your members</option>
        {(members.data?.members ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>

      <form onSubmit={submit} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-medium">Create a plan</h2>
        <div className="flex flex-wrap gap-3">
          <input value={form.goal} maxLength={255} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="Goal (e.g. Muscle gain)" className={`${input} min-w-64 flex-1`} required />
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={input} required />
          <input type="date" value={form.end_date} min={form.start_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={input} required />
        </div>
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className={`${input} w-full`} />
        {rows.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3">
            <select value={r.exercise_id} onChange={(e) => setRow(i, { exercise_id: e.target.value })} className={input} required>
              <option value="">Choose exercise</option>
              {(exercises.data?.exercises ?? []).map((x) => <option key={x.id} value={x.id}>{x.name} ({x.muscle_group})</option>)}
            </select>
            <input type="number" min="1" max="20" value={r.set_count} onChange={(e) => setRow(i, { set_count: e.target.value })} className={`${input} w-20`} title="Sets" />
            <input type="number" min="1" max="100" value={r.reps} onChange={(e) => setRow(i, { reps: e.target.value })} className={`${input} w-20`} title="Reps" />
            <input value={r.notes} onChange={(e) => setRow(i, { notes: e.target.value })} placeholder="Notes" className={`${input} min-w-48 flex-1`} />
            {rows.length > 1 && <button type="button" onClick={() => setRows(rows.filter((_, k) => k !== i))} className="text-sm text-red-600">Remove</button>}
          </div>
        ))}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setRows([...rows, blank()])} className="text-sm text-blue-700 underline">+ Add exercise</button>
          <button className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">Save plan</button>
          {msg && <span className={msg.ok ? 'text-sm text-emerald-700' : 'text-sm text-red-600'}>{msg.text}</span>}
        </div>
      </form>

      {memberId && plans.error && <p className="text-red-600">{plans.error}</p>}
      {existing.map((p) => (
        <section key={p.plan_id} className="space-y-2">
          <h2 className="font-medium">Plan #{p.plan_id}: {p.goal} <span className="text-sm font-normal text-gray-500">({p.start_date} to {p.end_date})</span></h2>
          <DataTable columns={[{ key: 'exercise', label: 'Exercise' }, { key: 'set_count', label: 'Sets' }, { key: 'reps', label: 'Reps' }, { key: 'notes', label: 'Notes' }]} rows={p.exercises} />
        </section>
      ))}
    </div>
  );
}
