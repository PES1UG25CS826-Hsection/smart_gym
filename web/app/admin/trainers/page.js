'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';

const input = 'rounded-md border border-gray-300 px-3 py-2 text-sm';
const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({ name: '', email: '', phone: '', specialization: '', hire_date: today(), password: '' });

export default function TrainersPage() {
  const [v, setV] = useState(0);
  const list = useFetch(`/api/admin/trainers?v=${v}`);
  const [form, setForm] = useState(blank());
  const [msg, setMsg] = useState(null);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function add(e) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch('/api/admin/trainers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const body = await res.json().catch(() => ({}));
    setMsg({ ok: res.ok, text: res.ok ? 'Trainer added' : body.error || 'Could not add trainer' });
    if (res.ok) { setForm(blank()); setV((n) => n + 1); }
  }

  async function remove(t) {
    if (!window.confirm(`Delete ${t.name}?`)) return;
    const res = await fetch(`/api/admin/trainers/${t.id}`, { method: 'DELETE' });
    const body = await res.json().catch(() => ({}));
    setMsg({ ok: res.ok, text: res.ok ? 'Trainer deleted' : body.error || 'Delete failed' });
    setV((n) => n + 1);
  }

  const rows = (list.data?.trainers ?? []).map((t) => ({ ...t, actions: <button onClick={() => remove(t)} className="text-red-600 underline">Delete</button> }));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Trainers</h1>
      <form onSubmit={add} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-medium">Add a trainer</h2>
        <div className="flex flex-wrap gap-3">
          <input name="name" value={form.name} onChange={change} placeholder="Full name" className={input} required />
          <input name="email" type="email" value={form.email} onChange={change} placeholder="Email" className={input} required />
          <input name="phone" value={form.phone} onChange={change} placeholder="Phone" className={input} />
          <input name="specialization" value={form.specialization} onChange={change} placeholder="Specialization" className={input} />
          <input name="hire_date" type="date" value={form.hire_date} onChange={change} className={input} required />
          <input name="password" type="password" value={form.password} onChange={change} placeholder="Temporary password (8+)" className={input} required />
          <button className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">Add trainer</button>
        </div>
      </form>
      {msg && <p className={msg.ok ? 'text-sm text-emerald-700' : 'text-sm text-red-600'}>{msg.text}</p>}
      {list.error && <p className="text-red-600">{list.error}</p>}
      <DataTable columns={[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'specialization', label: 'Specialization' }, { key: 'hire_date', label: 'Hired' }, { key: 'members', label: 'Members' }, { key: 'actions', label: '' }]} rows={rows} />
    </div>
  );
}
