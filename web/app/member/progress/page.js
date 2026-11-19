'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';

const today = () => new Date().toISOString().slice(0, 10);
const input = 'rounded-md border border-gray-300 px-3 py-2 text-sm';

export default function ProgressPage() {
  const [v, setV] = useState(0);
  const list = useFetch(`/api/member/progress?v=${v}`);
  const [form, setForm] = useState({ date: today(), weight_kg: '', body_fat_pct: '', chest_cm: '', waist_cm: '' });
  const [msg, setMsg] = useState(null);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch('/api/member/progress', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) { setMsg({ ok: true, text: 'Saved' }); setV((n) => n + 1); }
    else setMsg({ ok: false, text: body.error || 'Could not save' });
  }

  async function remove(id) {
    if (!window.confirm('Delete this entry?')) return;
    await fetch(`/api/member/progress/${id}`, { method: 'DELETE' });
    setV((n) => n + 1);
  }

  const rows = (list.data?.entries ?? []).map((en) => ({
    date: en.date.slice(0, 10),
    weight: en.weight_kg,
    fat: en.body_fat_pct ?? '-',
    chest: en.measurements?.chest_cm ?? '-',
    waist: en.measurements?.waist_cm ?? '-',
    actions: <button onClick={() => remove(en._id)} className="text-red-600 underline">Delete</button>,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Body Progress</h1>
      <form onSubmit={submit} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-medium">Add or update an entry (one per day)</h2>
        <div className="flex flex-wrap gap-3">
          <input name="date" type="date" value={form.date} max={today()} onChange={change} className={input} required />
          <input name="weight_kg" type="number" step="0.1" placeholder="Weight (kg)" value={form.weight_kg} onChange={change} className={`${input} w-36`} required />
          <input name="body_fat_pct" type="number" step="0.1" placeholder="Body fat %" value={form.body_fat_pct} onChange={change} className={`${input} w-32`} />
          <input name="chest_cm" type="number" step="0.1" placeholder="Chest (cm)" value={form.chest_cm} onChange={change} className={`${input} w-32`} />
          <input name="waist_cm" type="number" step="0.1" placeholder="Waist (cm)" value={form.waist_cm} onChange={change} className={`${input} w-32`} />
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">Save</button>
          {msg && <span className={msg.ok ? 'text-sm text-emerald-700' : 'text-sm text-red-600'}>{msg.text}</span>}
        </div>
      </form>
      {list.error && <p className="text-red-600">{list.error}</p>}
      <DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'weight', label: 'Weight (kg)' }, { key: 'fat', label: 'Body fat %' }, { key: 'chest', label: 'Chest (cm)' }, { key: 'waist', label: 'Waist (cm)' }, { key: 'actions', label: '' }]} rows={rows} />
    </div>
  );
}
