'use client';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';

export default function PlanPage() {
  const { data, error, loading } = useFetch('/api/member/plan');
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">My Workout Plans</h1>
      {data.plans.length === 0 && <p className="text-gray-600">Your trainer has not created a plan for you yet.</p>}
      {data.plans.map((p) => (
        <section key={p.plan_id} className="space-y-2">
          <h2 className="text-lg font-medium">{p.goal} <span className="text-sm font-normal text-gray-500">({p.start_date} to {p.end_date}, by {p.trainer})</span></h2>
          {p.description && <p className="text-sm text-gray-600">{p.description}</p>}
          <DataTable columns={[{ key: 'exercise', label: 'Exercise' }, { key: 'muscle_group', label: 'Muscle group' }, { key: 'set_count', label: 'Sets' }, { key: 'reps', label: 'Reps' }, { key: 'notes', label: 'Notes' }]} rows={p.exercises} />
        </section>
      ))}
    </div>
  );
}
