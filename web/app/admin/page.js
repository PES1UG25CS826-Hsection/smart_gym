'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';

const Card = ({ label, value }) => (
  <div className="rounded-xl bg-white p-5 shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-1 text-3xl font-semibold text-slate-800">{value}</p>
  </div>
);

export default function AdminHome() {
  const { data, error, loading } = useFetch('/api/admin/stats');
  const [msg, setMsg] = useState(null);

  async function notify() {
    setMsg(null);
    const res = await fetch('/api/admin/notify-expiring', { method: 'POST' });
    const body = await res.json().catch(() => ({}));
    setMsg(res.ok
      ? `Checked ${body.checked} expiring membership(s); ${body.created} new reminder(s) created`
      : body.error || 'Request failed');
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card label="Total members" value={data.members} />
        <Card label="Trainers" value={data.trainers} />
        <Card label="Active memberships" value={data.activeMemberships} />
        <Card label="Revenue this month" value={`Rs. ${data.revenueThisMonth.toLocaleString('en-IN')}`} />
        <Card label="Expiring in 7 days" value={data.expiringSoon} />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={notify} className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">Send expiry reminders</button>
        {msg && <span className="text-sm text-gray-700">{msg}</span>}
      </div>
    </div>
  );
}
