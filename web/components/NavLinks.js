'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCog, Dumbbell, CreditCard, CalendarCheck, CalendarDays, ClipboardList, Activity, TrendingUp, BadgeCheck, FileText } from 'lucide-react';

const ICONS = { dashboard: LayoutDashboard, users: Users, trainers: UserCog, exercises: Dumbbell, payments: CreditCard, attendance: CalendarCheck, appointments: CalendarDays, plans: ClipboardList, activity: Activity, progress: TrendingUp, membership: BadgeCheck, reports: FileText };

export default function NavLinks({ links, base, horizontal = false }) {
  const pathname = usePathname();
  return (
    <nav className={horizontal ? 'flex gap-2 overflow-x-auto pb-1' : 'flex flex-col gap-1'}>
      {links.map((l) => {
        const Icon = ICONS[l.icon] || LayoutDashboard;
        const active = l.href === base ? pathname === base : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              active ? 'bg-[#d4ff3a] text-[#0b0b0f]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
            <Icon size={18} /> {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
