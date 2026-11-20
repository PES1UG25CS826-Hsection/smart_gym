'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import { PageHeader, Notice, Loading, ErrorText, fieldCls } from '@/components/ui';

export default function PaymentsPage() {
  const [v, setV] = useState(0);
  const [status, setStatus] = useState('');
  const [msg, setMsg] = useState('');
  const { data, error, loading } = useFetch(`/api/admin/payments?status=${status}&v=${v}`);

  async function setPaymentStatus(id, value) {
    const res = await fetch(`/api/admin/payments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: value }) });
    const body = await res.json().catch(() => ({}));
    setMsg(res.ok ? '' : body.error || 'Update failed');
    setV((n) => n + 1);
  }

  if (error) return <ErrorText>{error}</ErrorText>;
  const rows = (data?.payments ?? []).map((p) => ({
    ...p, date: p.date.slice(0, 16),
    statusSelect: (
      <select value={p.status} onChange={(e) => setPaymentStatus(p.id, e.target.value)} className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm">
        <option>Success</option><option>Pending</option><option>Failed</option>
      </select>
    ),
  }));
  return (
    <div className="space-y-8">
      <PageHeader title="Payments" subtitle="Every membership payment in one place.">
        <div className="w-44">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={fieldCls}>
            <option value="">All payments</option><option>Success</option><option>Pending</option><option>Failed</option>
          </select>
        </div>
      </PageHeader>
      <Notice ok={false}>{msg}</Notice>
      {loading && !data ? <Loading /> : (
        <>
          <DataTable columns={[{ key: 'id', label: 'ID' }, { key: 'member', label: 'Member' }, { key: 'plan', label: 'Plan' }, { key: 'amount', label: 'Amount (Rs.)' }, { key: 'method', label: 'Method' }, { key: 'statusSelect', label: 'Status' }, { key: 'date', label: 'Date' }, { key: 'reference', label: 'Reference' }]} rows={rows} empty="No payments found" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div><h2 className="text-lg font-bold text-gray-900">Earnings by payment method</h2><p className="text-xs text-gray-500">Successful payments only</p></div>
              <DataTable columns={[{ key: 'method', label: 'Method' }, { key: 'payments', label: 'Payments' }, { key: 'total', label: 'Total (Rs.)' }]} rows={data.byMethod} />
            </div>
            <div className="space-y-3">
              <div><h2 className="text-lg font-bold text-gray-900">Larger than usual payments</h2><p className="text-xs text-gray-500">Payments above the member&apos;s own average</p></div>
              <DataTable columns={[{ key: 'member', label: 'Member' }, { key: 'amount', label: 'Amount (Rs.)' }, { key: 'date', label: 'Date' }]} rows={data.aboveAvg.map((r) => ({ ...r, date: r.date.slice(0, 10) }))} empty="No payment stands out" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
