'use client';
import { useState } from 'react';
import { Home, BarChart3, Bot, Settings, HelpCircle, LogOut, Users, MessageSquare, Menu, X, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  clientId?: string;
}

export default function Sidebar({ clientId }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const navItems = [
    { icon: Home, label: 'Dashboard', href: clientId ? `/app/${clientId}` : '/app' },
    { icon: Bot, label: 'Bots', href: clientId ? `/app/${clientId}` : '/app' },
    { icon: Store, label: 'Marketplace', href: clientId ? `/app/${clientId}/marketplace` : '/app' },
    { icon: MessageSquare, label: 'Conversations', href: clientId ? `/app/${clientId}/conversations` : '/app' },
    { icon: Users, label: 'Users', href: clientId ? `/app/${clientId}/users` : '/app' },
    { icon: BarChart3, label: 'Analytics', href: clientId ? `/app/${clientId}/analytics` : '/app' },
    { icon: Settings, label: 'Settings', href: clientId ? `/app/${clientId}/settings` : '/app' },
  ];

  const bottomItems = [
    { icon: HelpCircle, label: 'Help', href: '/help' },
    { icon: LogOut, label: 'Logout', href: '/login' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-black text-white rounded-lg"
      >
        <Menu size={20} />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-16 bg-black flex-col items-center py-4 z-40">
      <div className="mb-8">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <Bot className="w-6 h-6 text-black" />
        </div>
      </div>
      
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`
                w-12 h-12 flex items-center justify-center rounded-lg transition-colors
                ${isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </nav>
      
      <div className="flex flex-col gap-2 mt-auto">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="w-12 h-12 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-black flex flex-col py-4 px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-black" />
                </div>
                <span className="text-white font-semibold">ChatBot Platform</span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 text-white hover:bg-white/10 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-white/10 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            
            <div className="space-y-2 mt-auto pt-4 border-t border-white/10">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}