'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';

const input = 'rounded-md border border-gray-300 px-3 py-2 text-sm';
const blank = { name: '', email: '', phone: '', gender: 'M', dob: '', address: '', trainer_id: '', password: '' };

export default function MembersPage() {
  const [v, setV] = useState(0);
  const [text, setText] = useState('');
  const [applied, setApplied] = useState('');
  const members = useFetch(`/api/admin/members?search=${encodeURIComponent(applied)}&v=${v}`);
  const trainers = useFetch('/api/admin/trainers');
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState(null);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const trainerList = trainers.data?.trainers ?? [];

  async function add(e) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch('/api/admin/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const body = await res.json().catch(() => ({}));
    setMsg({ ok: res.ok, text: res.ok ? 'Member added' : body.error || 'Could not add member' });
    if (res.ok) { setForm(blank); setV((n) => n + 1); }
  }

  async function assign(id, value) {
    const res = await fetch(`/api/admin/members/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trainer_id: value === '' ? null : Number(value) }),
    });
    const body = await res.json().catch(() => ({}));
    setMsg({ ok: res.ok, text: res.ok ? 'Trainer updated' : body.error || 'Update failed' });
    setV((n) => n + 1);
  }

  async function remove(m) {
    if (!window.confirm(`Delete ${m.name}?`)) return;
    const res = await fetch(`/api/admin/members/${m.id}`, { method: 'DELETE' });
    const body = await res.json().catch(() => ({}));
    setMsg({ ok: res.ok, text: res.ok ? 'Member deleted' : body.error || 'Delete failed' });
    setV((n) => n + 1);
  }

  const rows = (members.data?.members ?? []).map((m) => ({
    ...m,
    trainerSelect: (
      <select value={m.trainer_id ?? ''} onChange={(e) => assign(m.id, e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm">
        <option value="">None</option>
        {trainerList.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
    ),
    actions: <button onClick={() => remove(m)} className="text-red-600 underline">Delete</button>,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Members</h1>
      <form onSubmit={add} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-medium">Add a member</h2>
        <div className="flex flex-wrap gap-3">
          <input name="name" value={form.name} onChange={change} placeholder="Full name" className={input} required />
          <input name="email" type="email" value={form.email} onChange={change} placeholder="Email" className={input} required />
          <input name="phone" value={form.phone} onChange={change} placeholder="Phone (10-15 digits)" className={input} />
          <select name="gender" value={form.gender} onChange={change} className={input}><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option></select>
          <input name="dob" type="date" value={form.dob} onChange={change} className={input} required />
          <input name="address" value={form.address} onChange={change} placeholder="Address" className={`${input} min-w-48`} />
          <select name="trainer_id" value={form.trainer_id} onChange={change} className={input}>
            <option value="">No trainer</option>
            {trainerList.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input name="password" type="password" value={form.password} onChange={change} placeholder="Temporary password (8+)" className={input} required />
          <button className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">Add member</button>
        </div>
      </form>
      {msg && <p className={msg.ok ? 'text-sm text-emerald-700' : 'text-sm text-red-600'}>{msg.text}</p>}
      <form onSubmit={(e) => { e.preventDefault(); setApplied(text); }} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search by name or email" className={`${input} w-72`} />
        <button className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">Search</button>
      </form>
      {members.error && <p className="text-red-600">{members.error}</p>}
      <DataTable
        columns={[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
                  { key: 'trainerSelect', label: 'Trainer' }, { key: 'membership', label: 'Active plan' }, { key: 'days_left', label: 'Days left' }, { key: 'actions', label: '' }]}
        rows={rows}
      />
    </div>
  );
}
