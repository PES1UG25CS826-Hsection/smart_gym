'use client';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import { PageHeader, Card, Loading, ErrorText } from '@/components/ui';

export default function PlanPage() {
  const { data, error, loading } = useFetch('/api/member/plan');
  if (loading) return <Loading />;
  if (error) return <ErrorText>{error}</ErrorText>;
  return (
    <div className="space-y-8">
      <PageHeader title="My workout plan" subtitle="Programmes created for you by your trainer." />
      {data.plans.length === 0 && <Card><p className="py-6 text-center text-sm text-gray-400">Your trainer has not created a plan for you yet.</p></Card>}
      {data.plans.map((p) => (
        <section key={p.plan_id} className="space-y-3">
          <div className="rounded-2xl bg-[#0b0b0f] p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4ff3a]">{p.start_date} to {p.end_date}</p>
            <h2 className="mt-1 text-xl font-black uppercase tracking-tight">{p.goal}</h2>
            <p className="mt-1 text-sm text-white/60">Coach {p.trainer}{p.description ? ` - ${p.description}` : ''}</p>
          </div>
          <DataTable columns={[{ key: 'exercise', label: 'Exercise' }, { key: 'muscle_group', label: 'Muscle group' }, { key: 'set_count', label: 'Sets' }, { key: 'reps', label: 'Reps' }, { key: 'notes', label: 'Coach notes' }]} rows={p.exercises} />
        </section>
      ))}
    </div>
  );
}
