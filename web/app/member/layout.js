import RoleLayout from '@/components/RoleLayout';

export default function MemberLayout({ children }) {
  const links = [
    { href: '/member', label: 'Home', icon: 'dashboard' },
    { href: '/member/membership', label: 'Membership', icon: 'membership' },
    { href: '/member/appointments', label: 'Appointments', icon: 'appointments' },
    { href: '/member/plan', label: 'My Plan', icon: 'plans' },
    { href: '/member/workouts', label: 'Workouts', icon: 'exercises' },
    { href: '/member/progress', label: 'Body Progress', icon: 'activity' },
  ];
  return <RoleLayout role="member" links={links}>{children}</RoleLayout>;
}
