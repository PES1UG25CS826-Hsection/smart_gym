'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me').then(async (r) => {
      if (!r.ok) return router.push('/login');
      setUser((await r.json()).user);
    });
  }, [router]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (!user) return <p className="p-8">Loading...</p>;
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
      <p>Role: <b>{user.role}</b> | ID: {user.id}</p>
      <button onClick={logout} className="rounded-md bg-slate-800 px-4 py-2 text-sm text-white">Log out</button>
    </main>
  );
}
