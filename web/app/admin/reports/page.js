'use client';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import { PageHeader, Loading, ErrorText } from '@/components/ui';

const NAMES = { workout_logs: 'Workout logs', body_progress: 'Body progress entries', activity_notifications: 'Notifications' };
const Section = ({ title, hint, children }) => (
  <section className="space-y-3">
    <div><h2 className="text-lg font-bold text-gray-900">{title}</h2>{hint && <p className="text-xs text-gray-500">{hint}</p>}</div>
    {children}
  </section>
);

export default function ReportsPage() {
  const { data, error, loading } = useFetch('/api/admin/reports');
  const nosql = useFetch('/api/admin/nosql-stats');
  if (loading) return <Loading />;
  if (error) return <ErrorText>{error}</ErrorText>;
  return (
    <div className="space-y-10">
      <PageHeader title="Reports" subtitle="How the gym is performing." />
      <Section title={`Monthly revenue ${data.year}`}>
        <DataTable columns={[{ key: 'month_no', label: 'Month' }, { key: 'revenue', label: 'Revenue (Rs.)' }, { key: 'pct_of_year', label: 'Share of year (%)' }]} rows={data.revenue} empty="No revenue recorded yet" />
      </Section>
      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Trainer workload">
          <DataTable columns={[{ key: 'trainer', label: 'Trainer' }, { key: 'members', label: 'Members' }, { key: 'upcoming', label: 'Upcoming sessions' }]} rows={data.workload} />
        </Section>
        <Section title="Most regular members" hint="Visits in the last 30 days">
          <DataTable columns={[{ key: 'name', label: 'Member' }, { key: 'visits', label: 'Visits' }]} rows={data.top} empty="No visits yet" />
        </Section>
      </div>
      <Section title="Members to win back" hint="No visit in the last 30 days">
        <DataTable columns={[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }]} rows={data.inactive} empty="Everyone has visited recently" />
      </Section>
      <div className="grid gap-8 lg:grid-cols-2">
        <Section title="Most popular exercises" hint="Most logged by members">
          {nosql.error && <ErrorText>{nosql.error}</ErrorText>}
          {nosql.data && <DataTable columns={[{ key: 'exercise', label: 'Exercise' }, { key: 'times', label: 'Times logged' }]} rows={nosql.data.popular} empty="No workouts logged yet" />}
        </Section>
        <Section title="Member activity records">
          {nosql.data && <DataTable columns={[{ key: 'collection', label: 'Record type' }, { key: 'documents', label: 'Count' }]} rows={nosql.data.totals.map((t) => ({ ...t, collection: NAMES[t.collection] || t.collection }))} />}
        </Section>
      </div>
    </div>
  );
}
