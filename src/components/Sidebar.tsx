'use client';
import { useState } from 'react';
import { Home, BarChart3, Bot, Settings, HelpCircle, LogOut, Users, MessageSquare, Menu, X, Store, ShoppingCart, User, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  clientId?: string;
}

export default function Sidebar({ clientId }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    window.location.href = '/login';
  };
  
  const navItems = [
    { icon: Home, label: 'Dashboard', href: clientId ? `/app/${clientId}/home` : '/app' },
    { icon: Bot, label: 'Bots', href: clientId ? `/app/${clientId}` : '/app' },
    { icon: Store, label: 'Marketplace', href: clientId ? `/app/${clientId}/marketplace` : '/app' },
    { icon: MessageSquare, label: 'Conversations', href: clientId ? `/app/${clientId}/conversations` : '/app' },
    { icon: Users, label: 'Users', href: clientId ? `/app/${clientId}/users` : '/app' },
    { icon: BarChart3, label: 'Analytics', href: clientId ? `/app/${clientId}/analytics` : '/app' },
    { icon: Settings, label: 'Settings', href: clientId ? `/app/${clientId}/settings` : '/app' },
  ];

  const bottomItems = [
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: HelpCircle, label: 'Help', href: '/help' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white text-foreground shadow-md rounded-lg dark:bg-sidebar-bg dark:text-sidebar-text-active dark:border dark:border-sidebar-border dark:shadow-none"
      >
        <Menu size={20} />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-16 bg-sidebar-bg flex-col items-center py-4 z-40 border-r border-sidebar-border">
      <div className="mb-8">
        <div className="w-10 h-10 bg-sidebar-text-active rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 282.65 250.44" width="22" height="20" className="text-sidebar-bg">
            <path d="M63.45,249.56H0V89.52C0,40.16,32.93,0,85.7,0c4.14,0,8.23.25,12.27.75,40.79,4.99,73.08,34.79,80.26,72.68l11.65,52.86c1,4.52,7.53,4.22,8.11-.37l15.3-121.86,69.37.15-37.75,245.41-80.68.81-44.81-177.17c-2.47-9.75-9.13-18.25-18.64-22.87-5.12-2.49-10.88-3.87-16.86-3.87-20.24,0-26.7,15.4-26.7,34.33l6.23,168.7Z" fill="currentColor"/>
          </svg>
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
                  ? 'bg-sidebar-item-active text-sidebar-text-active'
                  : 'text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover'
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
        {/* Cart Icon */}
        {clientId && (
          <button
            onClick={toggleCart}
            className="w-12 h-12 flex items-center justify-center rounded-lg text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover transition-colors relative"
            title={`Cart (${totalItems})`}
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
        )}

        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="w-12 h-12 flex items-center justify-center rounded-lg text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover transition-colors"
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="w-12 h-12 flex items-center justify-center rounded-lg text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-surface-overlay" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-sidebar-bg flex flex-col py-4 px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sidebar-text-active rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 282.65 250.44" width="22" height="20" className="text-sidebar-bg">
                    <path d="M63.45,249.56H0V89.52C0,40.16,32.93,0,85.7,0c4.14,0,8.23.25,12.27.75,40.79,4.99,73.08,34.79,80.26,72.68l11.65,52.86c1,4.52,7.53,4.22,8.11-.37l15.3-121.86,69.37.15-37.75,245.41-80.68.81-44.81-177.17c-2.47-9.75-9.13-18.25-18.64-22.87-5.12-2.49-10.88-3.87-16.86-3.87-20.24,0-26.7,15.4-26.7,34.33l6.23,168.7Z" fill="currentColor"/>
                  </svg>
                </div>
                <span className="text-sidebar-text-active font-semibold">notso.ai</span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 text-sidebar-text-active hover:bg-sidebar-item-hover rounded-lg"
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
                        ? 'bg-sidebar-item-active text-sidebar-text-active'
                        : 'text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-2 mt-auto pt-4 border-t border-sidebar-border">
              {/* Cart for Mobile */}
              {clientId && (
                <button
                  onClick={() => {
                    toggleCart();
                    setIsMobileOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5" />
                    Cart
                  </div>
                  {totalItems > 0 && (
                    <span className="bg-error-500 text-white text-xs px-2 py-1 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}

              {/* Theme Toggle for Mobile */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </div>
              </button>

              {bottomItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}