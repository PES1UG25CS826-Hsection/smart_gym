import DataTable from './DataTable';
import { Card } from './ui';

export default function AnalyticsPanel({ data }) {
  const max = Math.max(1, ...data.weekly.map((w) => w.volume));
  return (
    <div className="space-y-6">
      <Card title="Weekly training volume" subtitle="Total kilograms lifted each week">
        {data.weekly.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">No workouts logged yet.</p>
        ) : (
          <div className="space-y-2.5">
            {data.weekly.map((w) => (
              <div key={w.label} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-xs font-semibold text-gray-500">{w.label}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#0b0b0f] to-[#d4ff3a]" style={{ width: `${Math.max(4, (w.volume / max) * 100)}%` }} />
                </div>
                <span className="w-20 shrink-0 text-right font-bold text-gray-900">{Math.round(w.volume).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-base font-bold text-gray-900">Muscle groups trained</h3>
          <DataTable columns={[{ key: 'muscle', label: 'Muscle group' }, { key: 'volume', label: 'Volume (kg)' }, { key: 'sets', label: 'Sets' }]} rows={data.muscles.map((m) => ({ ...m, volume: Math.round(m.volume).toLocaleString('en-IN') }))} />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-bold text-gray-900">Personal records</h3>
          <DataTable columns={[{ key: 'exercise', label: 'Exercise' }, { key: 'max_weight', label: 'Heaviest set (kg)' }]} rows={data.prs} />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-bold text-gray-900">Body progress by month</h3>
        <DataTable columns={[{ key: 'month', label: 'Month' }, { key: 'avg_weight', label: 'Weight (kg)' }, { key: 'avg_fat', label: 'Body fat %' }]} rows={data.body} />
      </div>
    </div>
  );
}
