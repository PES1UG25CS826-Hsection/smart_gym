'use client';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';

export default function TrainerHome() {
  const members = useFetch('/api/trainer/members');
  const appts = useFetch('/api/trainer/appointments');
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">My Members</h1>
        {members.error && <p className="text-red-600">{members.error}</p>}
        {members.data && (
          <DataTable
            columns={[{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
                      { key: 'membership', label: 'Active plan' }, { key: 'days_left', label: 'Days left' }]}
            rows={members.data.members}
          />
        )}
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Upcoming appointments</h2>
        {appts.error && <p className="text-red-600">{appts.error}</p>}
        {appts.data && (
          <DataTable
            columns={[{ key: 'date', label: 'Date' }, { key: 'start', label: 'Start' }, { key: 'end', label: 'End' },
                      { key: 'member', label: 'Member' }, { key: 'status', label: 'Status' }]}
            rows={appts.data.appointments}
          />
        )}
      </section>
    </div>
  );
}
