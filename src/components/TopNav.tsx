'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function TopNav({ clientId }: { clientId?: string }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const tabs = [
    { href: `/app/${clientId}`, label: 'Dashboard' },
    { href: `/app/${clientId}?tab=analytics`, label: 'Analytics' },
    { href: `/app/${clientId}?tab=status`, label: 'Status' }
  ];

  const handleLogout = () => {
    // Call signOut but don't wait - redirect immediately
    signOut();
    window.location.href = '/login';
  };

  return (
    <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-40">
      <div className="container h-14 flex items-center justify-between">
        <Link href="/app" className="font-black text-lg">Chatbot<span className="brand-text">Platform</span></Link>
        {clientId && (
          <nav className="hidden md:flex items-center gap-6">
            {tabs.map(t => (
              <Link key={t.href} href={t.href} className={cn('text-sm hover:text-black', pathname === t.href ? 'font-semibold brand-text' : 'text-neutral-600')}>{t.label}</Link>
            ))}
          </nav>
        )}
        <button onClick={handleLogout} className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black">
          <LogOut size={16} /> Log out
        </button>
      </div>
    </header>
  );
}
