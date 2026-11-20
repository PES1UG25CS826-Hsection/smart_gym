'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import { Hero, StatCard, Notice, Loading, ErrorText, btnPrimary } from '@/components/ui';

export default function AdminHome() {
  const { data, error, loading } = useFetch('/api/admin/stats');
  const [msg, setMsg] = useState(null);

  async function notify() {
    setMsg(null);
    const res = await fetch('/api/admin/notify-expiring', { method: 'POST' });
    const body = await res.json().catch(() => ({}));
    setMsg(res.ok
      ? { ok: true, text: `${body.created} new reminder(s) sent to members whose plans end within 7 days` }
      : { ok: false, text: body.error || 'Request failed' });
  }

  if (loading) return <Loading />;
  if (error) return <ErrorText>{error}</ErrorText>;
  return (
    <div className="space-y-6">
      <Hero kicker="Studio overview" title="Today at Smart Gym">
        <button onClick={notify} className={btnPrimary}>Send renewal reminders</button>
      </Hero>
      <Notice ok={msg?.ok}>{msg?.text}</Notice>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total members" value={data.members} />
        <StatCard label="Active memberships" value={data.activeMemberships} hint="members currently allowed to train" />
        <StatCard label="Trainers" value={data.trainers} />
        <StatCard label="Revenue this month" value={`Rs. ${data.revenueThisMonth.toLocaleString('en-IN')}`} />
        <StatCard label="Plans ending soon" value={data.expiringSoon} hint="within the next 7 days" />
      </div>
    </div>
  );
}
