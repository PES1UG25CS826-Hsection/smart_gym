'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import { PageHeader, Card, Notice, ErrorText, btnPrimary, btnDark, fieldCls, linkDanger } from '@/components/ui';

const blank = { name: '', email: '', phone: '', gender: 'M', dob: '', address: '', trainer_id: '', password: '' };
const label = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500';

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
    const res = await fetch(`/api/admin/members/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trainer_id: value === '' ? null : Number(value) }) });
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
      <select value={m.trainer_id ?? ''} onChange={(e) => assign(m.id, e.target.value)} className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm">
        <option value="">None</option>
        {trainerList.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
    ),
    actions: <button onClick={() => remove(m)} className={linkDanger}>Delete</button>,
  }));

  return (
    <div className="space-y-8">
      <PageHeader title="Members" subtitle="Add members, assign trainers and keep records tidy." />
      <Card title="Add a member">
        <form onSubmit={add} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><label className={label}>Full name</label><input name="name" value={form.name} onChange={change} className={fieldCls} required /></div>
          <div><label className={label}>Email</label><input name="email" type="email" value={form.email} onChange={change} className={fieldCls} required /></div>
          <div><label className={label}>Phone</label><input name="phone" value={form.phone} onChange={change} placeholder="10 to 15 digits" className={fieldCls} /></div>
          <div><label className={label}>Gender</label><select name="gender" value={form.gender} onChange={change} className={fieldCls}><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option></select></div>
          <div><label className={label}>Date of birth</label><input name="dob" type="date" value={form.dob} onChange={change} className={fieldCls} required /></div>
          <div><label className={label}>Address</label><input name="address" value={form.address} onChange={change} className={fieldCls} /></div>
          <div><label className={label}>Trainer</label><select name="trainer_id" value={form.trainer_id} onChange={change} className={fieldCls}><option value="">No trainer</option>{trainerList.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <div><label className={label}>Temporary password</label><input name="password" type="password" value={form.password} onChange={change} autoComplete="new-password" placeholder="At least 8 characters" className={fieldCls} required /></div>
          <div className="sm:col-span-2 lg:col-span-4"><button className={btnPrimary}>Add member</button></div>
        </form>
      </Card>
      <Notice ok={msg?.ok}>{msg?.text}</Notice>
      <div className="space-y-3">
        <form onSubmit={(e) => { e.preventDefault(); setApplied(text); }} className="flex gap-2">
          <div className="relative flex-1 sm:max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search by name or email" className={`${fieldCls} pl-10`} />
          </div>
          <button className={btnDark}>Search</button>
        </form>
        <ErrorText>{members.error}</ErrorText>
        <DataTable columns={[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'trainerSelect', label: 'Trainer' }, { key: 'membership', label: 'Active plan' }, { key: 'days_left', label: 'Days left' }, { key: 'actions', label: '' }]} rows={rows} empty="No members found" />
      </div>
    </div>
  );
}
