'use client';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useFetch } from '@/components/useFetch';
import { Hero, StatCard, Card, Notice, Loading, ErrorText, btnPrimary, btnGhostLight } from '@/components/ui';

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

  if (loading && !data) return <Loading />;
  if (error) return <ErrorText>{error}</ErrorText>;
  const s = data.summary;
  const list = notes.data?.notifications ?? [];
  const unread = list.filter((n) => !n.read).length;
  const days = s?.days_left ?? 0;
  return (
    <div className="space-y-6">
      <Hero kicker="Welcome back" title={s?.name}>
        <button onClick={() => act('/api/member/checkin')} className={btnPrimary}>Check in</button>
        <button onClick={() => act('/api/member/checkout')} className={btnGhostLight}>Check out</button>
      </Hero>
      <Notice ok={msg?.ok}>{msg?.text}</Notice>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Membership" value={`${days} days`} hint={days > 0 ? 'left on your current plan' : 'Your plan has ended. Renew to keep training.'} />
        <StatCard label="Attendance" value={`${Number(s?.attendance_pct_30d ?? 0).toFixed(0)}%`} hint="of the last 30 days" />
        <StatCard label="Your trainer" value={s?.trainer_id ? `Trainer #${s.trainer_id}` : 'Not assigned'} hint="Book sessions from Appointments" />
      </div>
      <Card title={`Notifications${unread ? ` (${unread} new)` : ''}`} action={unread > 0 && <button onClick={markRead} className="text-sm font-semibold underline decoration-[#d4ff3a] decoration-2 underline-offset-4">Mark all read</button>}>
        {list.length === 0 ? <p className="py-4 text-center text-sm text-gray-400">You are all caught up.</p> : (
          <ul className="space-y-2">
            {list.map((n) => (
              <li key={n._id} className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${n.read ? 'border-gray-100 text-gray-500' : 'border-[#d4ff3a] bg-[#d4ff3a]/15 text-gray-900'}`}>
                <Bell size={16} className="mt-0.5 shrink-0" /> {n.message}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
