import RoleLayout from '@/components/RoleLayout';

export default function TrainerLayout({ children }) {
  const links = [
    { href: '/trainer', label: 'My Members' },
    { href: '/trainer/plans', label: 'Workout Plans' },
    { href: '/trainer/progress', label: 'Member Progress' },
  ];
  return <RoleLayout role="trainer" links={links}>{children}</RoleLayout>;
}
