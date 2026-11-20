'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import { PageHeader, Card, Notice, ErrorText, btnPrimary, btnDark, fieldCls, linkAction, linkDanger } from '@/components/ui';

const label = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500';

export default function ExercisesPage() {
  const [v, setV] = useState(0);
  const [text, setText] = useState('');
  const [applied, setApplied] = useState('');
  const list = useFetch(`/api/admin/exercises?search=${encodeURIComponent(applied)}&v=${v}`);
  const [form, setForm] = useState({ name: '', muscle_group: '', description: '' });
  const [msg, setMsg] = useState(null);

  async function add(e) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch('/api/admin/exercises', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const body = await res.json().catch(() => ({}));
    setMsg({ ok: res.ok, text: res.ok ? 'Exercise added' : body.error || 'Could not add' });
    if (res.ok) { setForm({ name: '', muscle_group: '', description: '' }); setV((n) => n + 1); }
  }
  async function edit(x) {
    const value = window.prompt('New description', x.description || '');
    if (value === null) return;
    await fetch(`/api/admin/exercises/${x.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: value }) });
    setV((n) => n + 1);
  }
  async function remove(x) {
    if (!window.confirm(`Delete ${x.name}?`)) return;
    const res = await fetch(`/api/admin/exercises/${x.id}`, { method: 'DELETE' });
    const body = await res.json().catch(() => ({}));
    setMsg({ ok: res.ok, text: res.ok ? 'Exercise deleted' : body.error || 'Delete failed' });
    setV((n) => n + 1);
  }

  const rows = (list.data?.exercises ?? []).map((x) => ({
    ...x,
    actions: (<span className="space-x-4 whitespace-nowrap"><button onClick={() => edit(x)} className={linkAction}>Edit description</button><button onClick={() => remove(x)} className={linkDanger}>Delete</button></span>),
  }));
  return (
    <div className="space-y-8">
      <PageHeader title="Exercise library" subtitle="The moves your trainers can use in workout plans." />
      <form onSubmit={(e) => { e.preventDefault(); setApplied(text); }} className="flex gap-2">
        <div className="relative flex-1 sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search exercises, e.g. leg strength" className={`${fieldCls} pl-10`} />
        </div>
        <button className={btnDark}>Search</button>
      </form>
      <Card title="Add an exercise">
        <form onSubmit={add} className="grid gap-4 sm:grid-cols-3">
          <div><label className={label}>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldCls} required /></div>
          <div><label className={label}>Muscle group</label><input value={form.muscle_group} onChange={(e) => setForm({ ...form, muscle_group: e.target.value })} className={fieldCls} required /></div>
          <div><label className={label}>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={fieldCls} /></div>
          <div className="sm:col-span-3"><button className={btnPrimary}>Add exercise</button></div>
        </form>
      </Card>
      <Notice ok={msg?.ok}>{msg?.text}</Notice>
      <ErrorText>{list.error}</ErrorText>
      <DataTable columns={[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'muscle_group', label: 'Muscle group' }, { key: 'description', label: 'Description' }, { key: 'actions', label: '' }]} rows={rows} empty="No exercises found" />
    </div>
  );
}
