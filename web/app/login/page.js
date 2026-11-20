'use client';
import { useEffect, useState } from 'react';
import { Flame, ShieldCheck, Dumbbell, UserRound } from 'lucide-react';
import { fieldCls, btnPrimary, ErrorText } from '@/components/ui';

const ROLES = [
  { key: 'member', label: 'Member', icon: Dumbbell },
  { key: 'trainer', label: 'Trainer', icon: UserRound },
  { key: 'admin', label: 'Admin', icon: ShieldCheck },
];

export default function LoginPage() {
  const [role, setRole] = useState('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // inputs stay read-only until clicked so the browser cannot auto-fill saved credentials
  const [armed, setArmed] = useState(false);

  useEffect(() => { setEmail(''); setPassword(''); }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); setPassword(''); }
      else window.location.assign(`/${data.role}`);
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#0b0b0f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-[#d4ff3a]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-10 h-96 w-96 rounded-full bg-fuchsia-600/25 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4ff3a] text-[#0b0b0f]"><Flame size={22} strokeWidth={2.6} /></span>
          <span className="text-xl font-black uppercase tracking-tight">Smart<span className="text-[#d4ff3a]">Gym</span></span>
        </div>
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d4ff3a]">Fitness, organised</p>
          <h1 className="mt-4 text-6xl font-black uppercase leading-[0.95] tracking-tight">Train<br />smarter.<br /><span className="text-[#d4ff3a]">Live<br />stronger.</span></h1>
          <p className="mt-6 max-w-md text-base text-white/70">Memberships, sessions, workout plans and progress, all in one place for members, trainers and the front desk.</p>
        </div>
        <div className="relative grid grid-cols-3 gap-4 text-center">
          {[['Plans', 'Tailored by trainers'], ['Sessions', 'Book in seconds'], ['Progress', 'Track every rep']].map(([a, b]) => (
            <div key={a} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-black uppercase tracking-wide text-[#d4ff3a]">{a}</p>
              <p className="mt-1 text-xs text-white/60">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#f4f5f7] px-6 py-12">
        <form onSubmit={onSubmit} autoComplete="off" className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b0b0f] text-[#d4ff3a]"><Flame size={22} strokeWidth={2.6} /></span>
            <span className="text-xl font-black uppercase tracking-tight text-[#0b0b0f]">SmartGym</span>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-500">Sign in to continue to your dashboard.</p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-200/70 p-1.5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <button type="button" key={r.key} onClick={() => setRole(r.key)}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition ${role === r.key ? 'bg-[#0b0b0f] text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Icon size={16} /> {r.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Email</label>
              <input name="login_email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                autoComplete="off" readOnly={!armed} onFocus={() => setArmed(true)} placeholder="you@example.com" className={fieldCls} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Password</label>
              <input name="login_secret" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password" readOnly={!armed} onFocus={() => setArmed(true)} placeholder="Your password" className={fieldCls} required />
            </div>
          </div>

          <ErrorText>{error}</ErrorText>
          <button disabled={loading} className={`${btnPrimary} w-full py-3.5 text-base`}>
            {loading ? 'Signing in...' : `Sign in as ${ROLES.find((r) => r.key === role).label}`}
          </button>
        </form>
      </section>
    </main>
  );
}
