import { cookies } from 'next/headers';
import { Flame } from 'lucide-react';
import { verifyToken, COOKIE } from '@/lib/auth';
import LogoutButton from './LogoutButton';
import NavLinks from './NavLinks';

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d4ff3a] text-[#0b0b0f]"><Flame size={20} strokeWidth={2.6} /></span>
      <span className="text-lg font-black uppercase tracking-tight text-white">Smart<span className="text-[#d4ff3a]">Gym</span></span>
    </div>
  );
}

export default async function RoleLayout({ role, links, children }) {
  const token = (await cookies()).get(COOKIE)?.value;
  const user = token ? await verifyToken(token) : null;
  const base = links[0].href;
  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden bg-[#0b0b0f] md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:justify-between md:p-5">
        <div className="space-y-8">
          <Logo />
          <NavLinks links={links} base={base} />
        </div>
        <div className="space-y-3 rounded-2xl bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d4ff3a] text-sm font-black text-[#0b0b0f]">{initial}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{user?.name}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#d4ff3a]">{role}</p>
            </div>
          </div>
          <LogoutButton className="w-full justify-center" />
        </div>
      </aside>

      <div className="flex-1 md:pl-64">
        <header className="space-y-3 bg-[#0b0b0f] px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <Logo />
            <LogoutButton />
          </div>
          <NavLinks links={links} base={base} horizontal />
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
