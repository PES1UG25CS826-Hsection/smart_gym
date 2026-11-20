'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import { PageHeader, Card, Notice, ErrorText, btnPrimary, fieldCls, linkAction, linkDanger } from '@/components/ui';

const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({ exercise_id: '', set_count: 3, reps: 10, notes: '' });
const label = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500';

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
    const res = await fetch('/api/trainer/plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, member_id: Number(memberId), exercises: rows }) });
    const body = await res.json().catch(() => ({}));
    if (res.ok) { setMsg({ ok: true, text: `Plan #${body.plan_id} created` }); setRows([blank()]); setV((n) => n + 1); }
    else setMsg({ ok: false, text: body.error || 'Could not create plan' });
  }

  const existing = memberId && plans.data?.plans ? plans.data.plans : [];
  return (
    <div className="space-y-8">
      <PageHeader title="Workout plans" subtitle="Build a programme for one of your members." />
      <Card title="Create a plan">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className={label}>Member</label>
              <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={fieldCls} required>
                <option value="">Choose one of your members</option>
                {(members.data?.members ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div><label className={label}>Starts</label><input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={fieldCls} required /></div>
            <div><label className={label}>Ends</label><input type="date" value={form.end_date} min={form.start_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={fieldCls} required /></div>
            <div className="lg:col-span-2"><label className={label}>Goal</label><input value={form.goal} maxLength={255} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="e.g. Muscle gain" className={fieldCls} required /></div>
            <div className="lg:col-span-2"><label className={label}>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" className={fieldCls} /></div>
          </div>
          {rows.map((r, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_2fr_auto] sm:items-end">
              <div><label className={label}>Exercise {i + 1}</label>
                <select value={r.exercise_id} onChange={(e) => setRow(i, { exercise_id: e.target.value })} className={fieldCls} required>
                  <option value="">Choose exercise</option>
                  {(exercises.data?.exercises ?? []).map((x) => <option key={x.id} value={x.id}>{x.name} ({x.muscle_group})</option>)}
                </select></div>
              <div><label className={label}>Sets</label><input type="number" min="1" max="20" value={r.set_count} onChange={(e) => setRow(i, { set_count: e.target.value })} className={fieldCls} /></div>
              <div><label className={label}>Reps</label><input type="number" min="1" max="100" value={r.reps} onChange={(e) => setRow(i, { reps: e.target.value })} className={fieldCls} /></div>
              <div><label className={label}>Notes</label><input value={r.notes} onChange={(e) => setRow(i, { notes: e.target.value })} className={fieldCls} placeholder="Optional" /></div>
              {rows.length > 1 ? <button type="button" onClick={() => setRows(rows.filter((_, k) => k !== i))} className={`${linkDanger} pb-3`}>Remove</button> : <span />}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => setRows([...rows, blank()])} className={`${linkAction} inline-flex items-center gap-1`}><Plus size={16} /> Add exercise</button>
            <button className={btnPrimary}>Save plan</button>
          </div>
        </form>
      </Card>
      <Notice ok={msg?.ok}>{msg?.text}</Notice>
      {memberId && <ErrorText>{plans.error}</ErrorText>}
      {existing.map((p) => (
        <section key={p.plan_id} className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">{p.goal} <span className="text-sm font-medium text-gray-500">({p.start_date} to {p.end_date})</span></h2>
          <DataTable columns={[{ key: 'exercise', label: 'Exercise' }, { key: 'set_count', label: 'Sets' }, { key: 'reps', label: 'Reps' }, { key: 'notes', label: 'Notes' }]} rows={p.exercises} />
        </section>
      ))}
    </div>
  );
}
