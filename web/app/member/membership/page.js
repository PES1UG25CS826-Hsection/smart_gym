'use client';
import { useState } from 'react';
import { useFetch } from '@/components/useFetch';
import DataTable from '@/components/DataTable';

const PLANS = { Monthly: 1800, Quarterly: 4500, 'Half-Yearly': 8000, Yearly: 15000 };
const METHODS = ['UPI', 'Card', 'Cash', 'NetBanking'];
const input = 'rounded-md border border-gray-300 px-3 py-2 text-sm';

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
      <h1 className="text-2xl font-semibold">Membership</h1>
      <form onSubmit={renew} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-medium">Buy or renew a plan</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select value={plan} onChange={(e) => setPlan(e.target.value)} className={input}>
            {Object.entries(PLANS).map(([k, a]) => <option key={k} value={k}>{k} (Rs. {a.toLocaleString('en-IN')})</option>)}
          </select>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className={input}>
            {METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
          <button disabled={busy} className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-60">
            {busy ? 'Processing...' : 'Pay and activate'}
          </button>
        </div>
        <p className="text-xs text-gray-500">The membership and payment are saved together in one database transaction. If anything fails, neither is saved.</p>
        {msg && <p className={msg.ok ? 'text-sm text-emerald-700' : 'text-sm text-red-600'}>{msg.text}</p>}
      </form>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Membership history</h2>
        {list.error && <p className="text-red-600">{list.error}</p>}
        <DataTable columns={[{ key: 'type', label: 'Plan' }, { key: 'start_date', label: 'Start' }, { key: 'end_date', label: 'End' }, { key: 'status', label: 'Status' }, { key: 'amount', label: 'Amount (Rs.)' }]} rows={list.data?.memberships ?? []} />
      </section>
    </div>
  );
}
