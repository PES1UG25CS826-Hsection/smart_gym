'use client';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';

export default function ReportsPage() {
  const { data, error, loading } = useFetch('/api/admin/reports');
  const nosql = useFetch('/api/admin/nosql-stats');
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <section className="space-y-2">
        <h2 className="font-medium">Monthly revenue {data.year} (stored procedure with CTE)</h2>
        <DataTable columns={[{ key: 'month_no', label: 'Month' }, { key: 'revenue', label: 'Revenue' }, { key: 'pct_of_year', label: '% of year' }]} rows={data.revenue} />
      </section>
      <section className="space-y-2">
        <h2 className="font-medium">Trainer workload (view)</h2>
        <DataTable columns={[{ key: 'trainer', label: 'Trainer' }, { key: 'members', label: 'Members' }, { key: 'upcoming', label: 'Upcoming appointments' }]} rows={data.workload} />
      </section>
      <section className="space-y-2">
        <h2 className="font-medium">Most regular members, last 30 days (CTE)</h2>
        <DataTable columns={[{ key: 'name', label: 'Member' }, { key: 'visits', label: 'Visits' }]} rows={data.top} />
      </section>
      <section className="space-y-2">
        <h2 className="font-medium">Members with no visit in 30 days (nested query)</h2>
        <DataTable columns={[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }]} rows={data.inactive} />
      </section>
      <section className="space-y-2">
        <h2 className="font-medium">Most logged exercises (MongoDB aggregation)</h2>
        {nosql.error && <p className="text-red-600">{nosql.error}</p>}
        {nosql.data && <DataTable columns={[{ key: 'exercise', label: 'Exercise' }, { key: 'times', label: 'Times logged' }]} rows={nosql.data.popular} />}
      </section>
      <section className="space-y-2">
        <h2 className="font-medium">MongoDB collections</h2>
        {nosql.data && <DataTable columns={[{ key: 'collection', label: 'Collection' }, { key: 'documents', label: 'Documents' }]} rows={nosql.data.totals} />}
      </section>
    </div>
  );
}
