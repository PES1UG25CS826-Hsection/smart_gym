import RoleLayout from '@/components/RoleLayout';

export default function AdminLayout({ children }) {
  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/members', label: 'Members' },
    { href: '/admin/trainers', label: 'Trainers' },
    { href: '/admin/exercises', label: 'Exercises' },
    { href: '/admin/payments', label: 'Payments' },
    { href: '/admin/attendance', label: 'Attendance' },
    { href: '/admin/reports', label: 'Reports' },
  ];
  return <RoleLayout role="admin" links={links}>{children}</RoleLayout>;
}
