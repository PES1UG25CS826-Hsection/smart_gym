'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';

const Card = ({ label, value }) => (
  <div className="rounded-xl bg-white p-5 shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-1 text-3xl font-semibold text-slate-800">{value}</p>
  </div>
);

export default function MemberHome() {
  const [version, setVersion] = useState(0);
  const [msg, setMsg] = useState(null);
  const { data, error, loading } = useFetch(`/api/member/summary?v=${version}`);
  const notes = useFetch(`/api/member/notifications?v=${version}`);

  async function act(path) {
    setMsg(null);
    const res = await fetch(path, { method: 'POST' });
    const body = await res.json().catch(() => ({}));
    setMsg({ ok: res.ok, text: res.ok ? body.message : body.error || 'Request failed' });
    setVersion((v) => v + 1);
  }

  async function markRead() {
    await fetch('/api/member/notifications', { method: 'PATCH' });
    setVersion((v) => v + 1);
  }

  if (loading && !data) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  const s = data.summary;
  const list = notes.data?.notifications ?? [];
  const unread = list.filter((n) => !n.read).length;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Hello, {s?.name}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="Membership days left" value={s?.days_left ?? 0} />
        <Card label="Attendance (last 30 days)" value={`${s?.attendance_pct_30d ?? 0}%`} />
        <Card label="Assigned trainer ID" value={s?.trainer_id ?? 'None'} />
      </div>
      <div className="flex gap-3">
        <button onClick={() => act('/api/member/checkin')} className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white">Check in</button>
        <button onClick={() => act('/api/member/checkout')} className="rounded-md bg-slate-700 px-4 py-2 text-sm text-white">Check out</button>
      </div>
      {msg && <p className={msg.ok ? 'text-emerald-700' : 'text-red-600'}>{msg.text}</p>}

      <section className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Notifications {unread > 0 && `(${unread} new)`}</h2>
          {unread > 0 && <button onClick={markRead} className="text-sm text-blue-700 underline">Mark all read</button>}
        </div>
        {list.length === 0 ? <p className="text-sm text-gray-500">No notifications.</p> : (
          <ul className="space-y-1 text-sm">
            {list.map((n) => (
              <li key={n._id} className={`rounded border p-3 ${n.read ? 'bg-white text-gray-500' : 'bg-amber-50 border-amber-200'}`}>
                {n.message}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
