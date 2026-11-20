'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import { PageHeader, Card, Notice, ErrorText, btnPrimary, fieldCls, linkDanger } from '@/components/ui';

const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({ name: '', email: '', phone: '', specialization: '', hire_date: today(), password: '' });
const label = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500';

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

  const rows = (list.data?.trainers ?? []).map((t) => ({ ...t, actions: <button onClick={() => remove(t)} className={linkDanger}>Delete</button> }));
  return (
    <div className="space-y-8">
      <PageHeader title="Trainers" subtitle="Manage the coaching team." />
      <Card title="Add a trainer">
        <form onSubmit={add} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><label className={label}>Full name</label><input name="name" value={form.name} onChange={change} className={fieldCls} required /></div>
          <div><label className={label}>Email</label><input name="email" type="email" value={form.email} onChange={change} className={fieldCls} required /></div>
          <div><label className={label}>Phone</label><input name="phone" value={form.phone} onChange={change} className={fieldCls} /></div>
          <div><label className={label}>Speciality</label><input name="specialization" value={form.specialization} onChange={change} className={fieldCls} /></div>
          <div><label className={label}>Joined on</label><input name="hire_date" type="date" value={form.hire_date} onChange={change} className={fieldCls} required /></div>
          <div><label className={label}>Temporary password</label><input name="password" type="password" value={form.password} onChange={change} autoComplete="new-password" placeholder="At least 8 characters" className={fieldCls} required /></div>
          <div className="sm:col-span-2 lg:col-span-3"><button className={btnPrimary}>Add trainer</button></div>
        </form>
      </Card>
      <Notice ok={msg?.ok}>{msg?.text}</Notice>
      <ErrorText>{list.error}</ErrorText>
      <DataTable columns={[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'specialization', label: 'Speciality' }, { key: 'hire_date', label: 'Joined' }, { key: 'members', label: 'Members' }, { key: 'actions', label: '' }]} rows={rows} empty="No trainers yet" />
    </div>
  );
}
