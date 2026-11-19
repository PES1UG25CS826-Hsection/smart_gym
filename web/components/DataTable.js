export default function DataTable({ columns, rows, empty = 'No records' }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>{columns.map((c) => <th key={c.key} className="px-4 py-2 font-medium">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">{empty}</td></tr>
          ) : rows.map((r, i) => (
            <tr key={i} className="border-t border-gray-100">
              {columns.map((c) => <td key={c.key} className="px-4 py-2">{r[c.key] ?? '-'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
