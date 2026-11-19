'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import AnalyticsPanel from '@/components/AnalyticsPanel';

export default function TrainerProgress() {
  const members = useFetch('/api/trainer/members');
  const [memberId, setMemberId] = useState('');
  const stats = useFetch(memberId ? `/api/trainer/member-analytics?memberId=${memberId}` : '/api/trainer/members');
  const showing = memberId && stats.data && stats.data.weekly;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Member Progress</h1>
      <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
        <option value="">Choose one of your members</option>
        {(members.data?.members ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      {memberId && stats.error && <p className="text-red-600">{stats.error}</p>}
      {showing && (
        <>
          <AnalyticsPanel data={stats.data} />
          <section className="space-y-2">
            <h2 className="font-medium">Latest workouts</h2>
            <DataTable
              columns={[{ key: 'date', label: 'Date' }, { key: 'duration', label: 'Duration' }, { key: 'exercises', label: 'Exercises' }]}
              rows={stats.data.logs.map((l) => ({
                date: l.date.slice(0, 10), duration: `${l.duration_min} min`,
                exercises: l.exercises.map((e) => e.name).join(', '),
              }))}
            />
          </section>
        </>
      )}
    </div>
  );
}
