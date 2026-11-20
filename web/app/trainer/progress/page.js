'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import { PageHeader, ErrorText, fieldCls } from '@/components/ui';

export default function TrainerProgress() {
  const members = useFetch('/api/trainer/members');
  const [memberId, setMemberId] = useState('');
  const stats = useFetch(memberId ? `/api/trainer/member-analytics?memberId=${memberId}` : '/api/trainer/members');
  const showing = memberId && stats.data && stats.data.weekly;
  return (
    <div className="space-y-8">
      <PageHeader title="Member progress" subtitle="See how your clients are training." />
      <div className="max-w-sm">
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={fieldCls}>
          <option value="">Choose one of your members</option>
          {(members.data?.members ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      {memberId && <ErrorText>{stats.error}</ErrorText>}
      {showing && (
        <>
          <AnalyticsPanel data={stats.data} />
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Latest workouts</h2>
            <DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'duration', label: 'Duration' }, { key: 'exercises', label: 'Exercises' }]}
              rows={stats.data.logs.map((l) => ({ date: l.date.slice(0, 10), duration: `${l.duration_min} min`, exercises: l.exercises.map((e) => e.name).join(', ') }))} empty="No workouts logged yet" />
          </div>
        </>
      )}
    </div>
  );
}
