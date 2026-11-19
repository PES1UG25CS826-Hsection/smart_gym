'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';

const input = 'rounded-md border border-gray-300 px-3 py-2 text-sm';

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
    const text = window.prompt('New description', x.description || '');
    if (text === null) return;
    await fetch(`/api/admin/exercises/${x.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: text }) });
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
    actions: (
      <span className="space-x-3 whitespace-nowrap">
        <button onClick={() => edit(x)} className="text-blue-700 underline">Edit description</button>
        <button onClick={() => remove(x)} className="text-red-600 underline">Delete</button>
      </span>
    ),
  }));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Exercise Library</h1>
      <form onSubmit={(e) => { e.preventDefault(); setApplied(text); }} className="flex flex-wrap items-center gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Full-text search, e.g. leg strength" className={`${input} w-80`} />
        <button className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">Search</button>
        {applied && list.data && <span className="text-xs text-gray-500">Matched using {list.data.mode === 'fulltext' ? 'MySQL FULLTEXT index' : 'LIKE fallback'}</span>}
      </form>
      <form onSubmit={add} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-medium">Add an exercise</h2>
        <div className="flex flex-wrap gap-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className={input} required />
          <input value={form.muscle_group} onChange={(e) => setForm({ ...form, muscle_group: e.target.value })} placeholder="Muscle group" className={input} required />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className={`${input} min-w-64 flex-1`} />
          <button className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">Add</button>
        </div>
      </form>
      {msg && <p className={msg.ok ? 'text-sm text-emerald-700' : 'text-sm text-red-600'}>{msg.text}</p>}
      {list.error && <p className="text-red-600">{list.error}</p>}
      <DataTable columns={[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'muscle_group', label: 'Muscle group' }, { key: 'description', label: 'Description' }, { key: 'actions', label: '' }]} rows={rows} />
    </div>
  );
}
