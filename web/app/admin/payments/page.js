'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';

export default function PaymentsPage() {
  const [v, setV] = useState(0);
  const [status, setStatus] = useState('');
  const [msg, setMsg] = useState(null);
  const { data, error, loading } = useFetch(`/api/admin/payments?status=${status}&v=${v}`);

  async function setPaymentStatus(id, value) {
    const res = await fetch(`/api/admin/payments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: value }) });
    const body = await res.json().catch(() => ({}));
    setMsg(res.ok ? null : body.error || 'Update failed');
    setV((n) => n + 1);
  }

  if (error) return <p className="text-red-600">{error}</p>;
  const rows = (data?.payments ?? []).map((p) => ({
    ...p, date: p.date.slice(0, 16),
    statusSelect: (
      <select value={p.status} onChange={(e) => setPaymentStatus(p.id, e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm">
        <option>Success</option><option>Pending</option><option>Failed</option>
      </select>
    ),
  }));
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Payments</h1>
      <div className="flex items-center gap-3">
        <label className="text-sm">Filter by status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="">All</option><option>Success</option><option>Pending</option><option>Failed</option>
        </select>
        {msg && <span className="text-sm text-red-600">{msg}</span>}
      </div>
      {loading && !data ? <p>Loading...</p> : (
        <>
          <DataTable columns={[{ key: 'id', label: 'ID' }, { key: 'member', label: 'Member' }, { key: 'plan', label: 'Plan' }, { key: 'amount', label: 'Amount' }, { key: 'method', label: 'Method' }, { key: 'statusSelect', label: 'Status' }, { key: 'date', label: 'Date' }, { key: 'reference', label: 'Reference' }]} rows={rows} />
          <section className="space-y-2">
            <h2 className="font-medium">Successful payments by method (GROUP BY)</h2>
            <DataTable columns={[{ key: 'method', label: 'Method' }, { key: 'payments', label: 'Payments' }, { key: 'total', label: 'Total (Rs.)' }]} rows={data.byMethod} />
          </section>
          <section className="space-y-2">
            <h2 className="font-medium">Payments above the member's own average (correlated subquery)</h2>
            <DataTable columns={[{ key: 'member', label: 'Member' }, { key: 'amount', label: 'Amount' }, { key: 'date', label: 'Date' }]} rows={data.aboveAvg.map((r) => ({ ...r, date: r.date.slice(0, 10) }))} empty="No payment is above its member's average" />
          </section>
        </>
      )}
    </div>
  );
}
