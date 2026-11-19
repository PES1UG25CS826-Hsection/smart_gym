'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';

const today = () => new Date().toISOString().slice(0, 10);
const input = 'rounded-md border border-gray-300 px-3 py-2 text-sm';

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
    const res = await fetch('/api/member/appointments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
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
    action: a.status === 'Scheduled' && a.date >= today()
      ? <button onClick={() => cancel(a.appointment_id)} className="text-red-600 underline">Cancel</button> : '-',
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Appointments</h1>
      <form onSubmit={(e) => { e.preventDefault(); setApplied(search); }} className="flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a trainer by name or speciality" className={`${input} w-80`} />
        <button className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">Search</button>
      </form>
      <form onSubmit={book} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-medium">Book a session</h2>
        <div className="flex flex-wrap gap-3">
          <select name="trainer_id" value={form.trainer_id} onChange={change} className={input} required>
            <option value="">Choose trainer</option>
            {(trainers.data?.trainers ?? []).map((t) => <option key={t.trainer_id} value={t.trainer_id}>{t.name} - {t.specialization}</option>)}
          </select>
          <input name="date" type="date" min={today()} value={form.date} onChange={change} className={input} required />
          <input name="start" type="time" value={form.start} onChange={change} className={input} required />
          <input name="end" type="time" value={form.end} onChange={change} className={input} required />
          <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Book</button>
        </div>
        {msg && <p className={msg.ok ? 'text-sm text-emerald-700' : 'text-sm text-red-600'}>{msg.text}</p>}
      </form>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Your appointments</h2>
        {list.error && <p className="text-red-600">{list.error}</p>}
        <DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'time', label: 'Time' }, { key: 'trainer', label: 'Trainer' }, { key: 'status', label: 'Status' }, { key: 'action', label: '' }]} rows={rows} />
      </section>
    </div>
  );
}
