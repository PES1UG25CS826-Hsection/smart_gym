import RoleLayout from '@/components/RoleLayout';

export default function AdminLayout({ children }) {
  const links = [
    { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { href: '/admin/members', label: 'Members', icon: 'users' },
    { href: '/admin/trainers', label: 'Trainers', icon: 'trainers' },
    { href: '/admin/exercises', label: 'Exercises', icon: 'exercises' },
    { href: '/admin/payments', label: 'Payments', icon: 'payments' },
    { href: '/admin/attendance', label: 'Attendance', icon: 'attendance' },
    { href: '/admin/reports', label: 'Reports', icon: 'reports' },
  ];
  return <RoleLayout role="admin" links={links}>{children}</RoleLayout>;
}
