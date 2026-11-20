const BADGES = {
  Active: 'bg-emerald-100 text-emerald-800', Success: 'bg-emerald-100 text-emerald-800', Present: 'bg-emerald-100 text-emerald-800', Completed: 'bg-emerald-100 text-emerald-800',
  Scheduled: 'bg-sky-100 text-sky-800', Pending: 'bg-amber-100 text-amber-800', Late: 'bg-amber-100 text-amber-800',
  Expired: 'bg-red-100 text-red-700', Failed: 'bg-red-100 text-red-700', Absent: 'bg-red-100 text-red-700', Cancelled: 'bg-gray-200 text-gray-700',
};

export default function DataTable({ columns, rows, empty = 'Nothing to show yet' }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>{columns.map((c) => <th key={c.key} className="whitespace-nowrap px-4 py-3">{c.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">{empty}</td></tr>
            ) : rows.map((r, i) => (
              <tr key={i} className="transition hover:bg-gray-50/70">
                {columns.map((c) => {
                  const v = r[c.key];
                  const badge = c.key === 'status' && typeof v === 'string' && BADGES[v];
                  return (
                    <td key={c.key} className="px-4 py-3 text-gray-800">
                      {badge ? <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge}`}>{v}</span> : (v ?? '-')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
