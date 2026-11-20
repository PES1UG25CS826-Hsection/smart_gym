'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import { PageHeader, Card, Notice, ErrorText, btnPrimary, btnDark, fieldCls, inputCls, linkDanger } from '@/components/ui';

const today = () => new Date().toISOString().slice(0, 10);
const label = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500';

export default function AppointmentsPage() {
  const [v, setV] = useState(0);
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const trainers = useFetch(`/api/member/trainers?search=${encodeURIComponent(applied)}`);
  const list = useFetch(`/api/member/appointments?v=${v}`);
  const [form, setForm] = useState({ trainer_id: '', date: today(), start: '07:00', end: '08:00' });
  const [msg, setMsg] = useState(null);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function book(e) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch('/api/member/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const body = await res.json().catch(() => ({}));
    setMsg({ ok: res.ok, text: res.ok ? body.message : body.error || 'Could not book' });
    if (res.ok) setV((n) => n + 1);
  }
  async function cancel(id) {
    if (!window.confirm('Cancel this appointment?')) return;
    const res = await fetch(`/api/member/appointments/${id}`, { method: 'DELETE' });
    const body = await res.json().catch(() => ({}));
    setMsg({ ok: res.ok, text: res.ok ? body.message : body.error || 'Could not cancel' });
    setV((n) => n + 1);
  }

  const rows = (list.data?.appointments ?? []).map((a) => ({
    date: a.date, time: `${a.start_time.slice(0, 5)} - ${a.end_time.slice(0, 5)}`, trainer: a.trainer, status: a.status,
    action: a.status === 'Scheduled' && a.date >= today() ? <button onClick={() => cancel(a.appointment_id)} className={linkDanger}>Cancel</button> : '-',
  }));

  return (
    <div className="space-y-8">
      <PageHeader title="Appointments" subtitle="Book one-to-one sessions with our trainers." />
      <Card title="Book a session">
        <form onSubmit={(e) => { e.preventDefault(); setApplied(search); }} className="mb-4 flex gap-2">
          <div className="relative flex-1 sm:max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a trainer by name or speciality" className={`${fieldCls} pl-10`} />
          </div>
          <button className={btnDark}>Search</button>
        </form>
        <form onSubmit={book} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <div className="lg:col-span-2">
            <label className={label}>Trainer</label>
            <select name="trainer_id" value={form.trainer_id} onChange={change} className={fieldCls} required>
              <option value="">Choose trainer</option>
              {(trainers.data?.trainers ?? []).map((t) => <option key={t.trainer_id} value={t.trainer_id}>{t.name} - {t.specialization}</option>)}
            </select>
          </div>
          <div><label className={label}>Date</label><input name="date" type="date" min={today()} value={form.date} onChange={change} className={fieldCls} required /></div>
          <div><label className={label}>From</label><input name="start" type="time" value={form.start} onChange={change} className={fieldCls} required /></div>
          <div><label className={label}>To</label><input name="end" type="time" value={form.end} onChange={change} className={fieldCls} required /></div>
          <div className="sm:col-span-2 lg:col-span-5"><button className={btnPrimary}>Book session</button></div>
        </form>
      </Card>
      <Notice ok={msg?.ok}>{msg?.text}</Notice>
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Your sessions</h2>
        <ErrorText>{list.error}</ErrorText>
        <DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'time', label: 'Time' }, { key: 'trainer', label: 'Trainer' }, { key: 'status', label: 'Status' }, { key: 'action', label: '' }]} rows={rows} empty="No sessions booked yet" />
      </div>
    </div>
  );
}
