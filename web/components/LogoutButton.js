'use client';
import { LogOut } from 'lucide-react';

export default function LogoutButton({ className = '' }) {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    // full page load so no form state or cached page survives the logout
    window.location.assign('/login');
  }
  return (
    <button onClick={logout} className={`inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 ${className}`}>
      <LogOut size={16} /> Log out
    </button>
  );
}
