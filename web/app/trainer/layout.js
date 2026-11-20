import RoleLayout from '@/components/RoleLayout';

export default function TrainerLayout({ children }) {
  const links = [
    { href: '/trainer', label: 'My Members', icon: 'users' },
    { href: '/trainer/plans', label: 'Workout Plans', icon: 'plans' },
    { href: '/trainer/progress', label: 'Member Progress', icon: 'progress' },
  ];
  return <RoleLayout role="trainer" links={links}>{children}</RoleLayout>;
}
