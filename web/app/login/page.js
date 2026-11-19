'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Login failed');
      else router.push(`/${data.role}`);
    } catch {
      setError('Network error');
    }
    setLoading(false);
  }

  const input = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm';
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow">
        <h1 className="text-xl font-semibold text-slate-800">Smart Gym Login</h1>
        <select name="role" value={form.role} onChange={change} className={input}>
          <option value="member">Member</option>
          <option value="trainer">Trainer</option>
          <option value="admin">Admin</option>
        </select>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} className={input} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={change} className={input} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full rounded-md bg-slate-800 py-2 text-sm text-white disabled:opacity-60">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
