'use client';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import { Hero, StatCard, ErrorText, Loading } from '@/components/ui';

export default function TrainerHome() {
  const members = useFetch('/api/trainer/members');
  const appts = useFetch('/api/trainer/appointments');
  const mList = members.data?.members ?? [];
  const aList = appts.data?.appointments ?? [];
  const active = mList.filter((m) => m.membership).length;
  return (
    <div className="space-y-8">
      <Hero kicker="Coach dashboard" title="Your clients" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Assigned members" value={mList.length} />
        <StatCard label="Active memberships" value={active} hint="members who can train today" />
        <StatCard label="Upcoming sessions" value={aList.length} />
      </div>
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">My members</h2>
        <ErrorText>{members.error}</ErrorText>
        {members.loading ? <Loading /> : (
          <DataTable columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'membership', label: 'Active plan' }, { key: 'days_left', label: 'Days left' }]} rows={mList} empty="No members are assigned to you yet" />
        )}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Upcoming sessions</h2>
        <ErrorText>{appts.error}</ErrorText>
        <DataTable columns={[{ key: 'date', label: 'Date' }, { key: 'start', label: 'Start' }, { key: 'end', label: 'End' }, { key: 'member', label: 'Member' }, { key: 'status', label: 'Status' }]} rows={aList} empty="No upcoming sessions" />
      </section>
    </div>
  );
}
