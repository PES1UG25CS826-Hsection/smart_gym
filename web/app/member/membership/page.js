'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';
import { PageHeader, Card, Notice, ErrorText, btnPrimary, fieldCls } from '@/components/ui';

const PLANS = { Monthly: { price: 1800, note: '1 month' }, Quarterly: { price: 4500, note: '3 months' }, 'Half-Yearly': { price: 8000, note: '6 months' }, Yearly: { price: 15000, note: '12 months' } };
const METHODS = ['UPI', 'Card', 'Cash', 'NetBanking'];

export default function MembershipPage() {
  const [v, setV] = useState(0);
  const [plan, setPlan] = useState('Monthly');
  const [method, setMethod] = useState('UPI');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const list = useFetch(`/api/member/membership?v=${v}`);

  async function renew(e) {
    e.preventDefault();
    setMsg(null); setBusy(true);
    const res = await fetch('/api/member/membership/renew', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan, method }),
    });
    const body = await res.json().catch(() => ({}));
    setMsg({ ok: res.ok, text: res.ok ? `${body.message}. Payment reference ${body.reference}` : body.error || 'Payment failed' });
    setBusy(false);
    if (res.ok) setV((n) => n + 1);
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Membership" subtitle="Choose a plan, pay, and start training right away." />
      <form onSubmit={renew} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(PLANS).map(([k, p]) => (
            <button type="button" key={k} onClick={() => setPlan(k)}
              className={`rounded-2xl border-2 p-5 text-left transition ${plan === k ? 'border-[#0b0b0f] bg-[#0b0b0f] text-white shadow-lg' : 'border-gray-200 bg-white hover:border-gray-400'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${plan === k ? 'text-[#d4ff3a]' : 'text-gray-500'}`}>{k}</p>
              <p className="mt-2 text-3xl font-black">Rs. {p.price.toLocaleString('en-IN')}</p>
              <p className={`mt-1 text-sm ${plan === k ? 'text-white/70' : 'text-gray-500'}`}>{p.note}</p>
            </button>
          ))}
        </div>
        <Card>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-48">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Pay with</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className={fieldCls}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
            </div>
            <button disabled={busy} className={btnPrimary}>{busy ? 'Processing...' : `Pay Rs. ${PLANS[plan].price.toLocaleString('en-IN')} and activate`}</button>
          </div>
          <p className="mt-3 text-xs text-gray-500">Your membership and payment are processed together, so you are never charged without an active plan.</p>
        </Card>
      </form>
      <Notice ok={msg?.ok}>{msg?.text}</Notice>
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Membership history</h2>
        <ErrorText>{list.error}</ErrorText>
        <DataTable columns={[{ key: 'type', label: 'Plan' }, { key: 'start_date', label: 'Starts' }, { key: 'end_date', label: 'Ends' }, { key: 'status', label: 'Status' }, { key: 'amount', label: 'Amount (Rs.)' }]} rows={list.data?.memberships ?? []} />
      </div>
    </div>
  );
}
