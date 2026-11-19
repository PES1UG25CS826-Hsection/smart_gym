import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE } from '@/lib/auth';
import LogoutButton from './LogoutButton';

export default async function RoleLayout({ role, links, children }) {
  const token = (await cookies()).get(COOKIE)?.value;
  const user = token ? await verifyToken(token) : null;
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <header className="bg-slate-800 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-3">
          <div className="flex flex-wrap items-center gap-6">
            <span className="font-semibold">Smart Gym</span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs uppercase">{role}</span>
            <nav className="flex flex-wrap gap-4 text-sm">
              {links.map((l) => <Link key={l.href} href={l.href} className="hover:underline">{l.label}</Link>)}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span>{user?.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
