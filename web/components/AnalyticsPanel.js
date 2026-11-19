import DataTable from './DataTable';

export default function AnalyticsPanel({ data }) {
  const max = Math.max(1, ...data.weekly.map((w) => w.volume));
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="font-medium">Weekly training volume (kg lifted)</h2>
        {data.weekly.length === 0 ? (
          <p className="text-sm text-gray-500">No workouts logged yet.</p>
        ) : (
          <div className="space-y-1">
            {data.weekly.map((w) => (
              <div key={w.label} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-gray-600">{w.label}</span>
                <div className="h-4 rounded bg-slate-700" style={{ width: `${(w.volume / max) * 60}%`, minWidth: 4 }} />
                <span>{Math.round(w.volume).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="space-y-2">
        <h2 className="font-medium">Volume by muscle group</h2>
        <DataTable columns={[{ key: 'muscle', label: 'Muscle group' }, { key: 'volume', label: 'Volume (kg)' }, { key: 'sets', label: 'Sets' }]}
                   rows={data.muscles.map((m) => ({ ...m, volume: Math.round(m.volume) }))} />
      </section>
      <section className="space-y-2">
        <h2 className="font-medium">Personal records (heaviest set)</h2>
        <DataTable columns={[{ key: 'exercise', label: 'Exercise' }, { key: 'max_weight', label: 'Max weight (kg)' }]} rows={data.prs} />
      </section>
      <section className="space-y-2">
        <h2 className="font-medium">Body progress by month (average)</h2>
        <DataTable columns={[{ key: 'month', label: 'Month' }, { key: 'avg_weight', label: 'Weight (kg)' }, { key: 'avg_fat', label: 'Body fat %' }]} rows={data.body} />
      </section>
    </div>
  );
}
