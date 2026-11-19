import RoleLayout from '@/components/RoleLayout';

export default function MemberLayout({ children }) {
  const links = [
    { href: '/member', label: 'Dashboard' },
    { href: '/member/membership', label: 'Membership' },
    { href: '/member/appointments', label: 'Appointments' },
    { href: '/member/plan', label: 'My Plan' },
    { href: '/member/workouts', label: 'Workouts' },
    { href: '/member/progress', label: 'Body Progress' },
  ];
  return <RoleLayout role="member" links={links}>{children}</RoleLayout>;
}
