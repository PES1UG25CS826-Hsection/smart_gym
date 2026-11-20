'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import { PageHeader, ErrorText, fieldCls } from '@/components/ui';

const today = () => new Date().toISOString().slice(0, 10);

export default function AttendancePage() {
  const [date, setDate] = useState(today());
  const [memberId, setMemberId] = useState('');
  const list = useFetch(`/api/admin/attendance?date=${date}`);
  const members = useFetch('/api/admin/members');
  const missed = useFetch(memberId ? `/api/admin/missed-days?memberId=${memberId}` : '/api/admin/trainers');
  const days = memberId && missed.data?.days ? missed.data.days : null;

  return (
    <div className="space-y-8">
      <PageHeader title="Attendance" subtitle="Who trained, and when.">
        <div className="w-48"><input type="date" value={date} onChange={(e) => setDate(e.target.value || today())} className={fieldCls} /></div>
      </PageHeader>
      <ErrorText>{list.error}</ErrorText>
      <DataTable columns={[{ key: 'member', label: 'Member' }, { key: 'date', label: 'Date' }, { key: 'check_in', label: 'Check in' }, { key: 'check_out', label: 'Check out' }, { key: 'status', label: 'Status' }]} rows={list.data?.attendance ?? []} empty="No check-ins on this date" />
      <section className="space-y-3">
        <div><h2 className="text-lg font-bold text-gray-900">Days missed in the last 30 days</h2><p className="text-xs text-gray-500">Pick a member to see the days they did not visit</p></div>
        <div className="max-w-sm">
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={fieldCls}>
            <option value="">Choose a member</option>
            {(members.data?.members ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        {memberId && <ErrorText>{missed.error}</ErrorText>}
        {days && (
          <>
            <p className="text-sm text-gray-600">{days.length} of the last 30 days without a visit</p>
            <DataTable columns={[{ key: 'missed_day', label: 'Day' }]} rows={days} empty="Perfect attendance" />
          </>
        )}
      </section>
    </div>
  );
}
