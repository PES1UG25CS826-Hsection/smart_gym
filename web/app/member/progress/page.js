'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import { PageHeader, Card, Notice, ErrorText, btnPrimary, fieldCls, linkDanger } from '@/components/ui';

const today = () => new Date().toISOString().slice(0, 10);
const label = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500';

export default function ProgressPage() {
  const [v, setV] = useState(0);
  const list = useFetch(`/api/member/progress?v=${v}`);
  const [form, setForm] = useState({ date: today(), weight_kg: '', body_fat_pct: '', chest_cm: '', waist_cm: '' });
  const [msg, setMsg] = useState(null);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch('/api/member/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
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
    date: en.date.slice(0, 10), weight: en.weight_kg, fat: en.body_fat_pct ?? '-', chest: en.measurements?.chest_cm ?? '-', waist: en.measurements?.waist_cm ?? '-',
    actions: <button onClick={() => remove(en._id)} className={linkDanger}>Delete</button>,
  }));

  return (
    <div className="space-y-8">
      <PageHeader title="Body progress" subtitle="One entry per day. Saving the same date again updates it." />
      <Card title="Add an entry">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <div><label className={label}>Date</label><input name="date" type="date" value={form.date} max={today()} onChange={change} className={fieldCls} required /></div>
          <div><label className={label}>Weight (kg)</label><input name="weight_kg" type="number" step="0.1" value={form.weight_kg} onChange={change} className={fieldCls} required /></div>
          <div><label className={label}>Body fat %</label><input name="body_fat_pct" type="number" step="0.1" value={form.body_fat_pct} onChange={change} className={fieldCls} /></div>
          <div><label className={label}>Chest (cm)</label><input name="chest_cm" type="number" step="0.1" value={form.chest_cm} onChange={change} className={fieldCls} /></div>
          <div><label className={label}>Waist (cm)</label><input name="waist_cm" type="number" step="0.1" value={form.waist_cm} onChange={change} className={fieldCls} /></div>
          <div className="sm:col-span-2 lg:col-span-5"><button className={btnPrimary}>Save entry</button></div>
        </form>
      </Card>
      <Notice ok={msg?.ok}>{msg?.text}</Notice>
      <ErrorText>{list.error}</ErrorText>
      <DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'weight', label: 'Weight (kg)' }, { key: 'fat', label: 'Body fat %' }, { key: 'chest', label: 'Chest (cm)' }, { key: 'waist', label: 'Waist (cm)' }, { key: 'actions', label: '' }]} rows={rows} empty="No entries yet" />
    </div>
  );
}
