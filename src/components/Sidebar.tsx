'use client';
import { useState } from 'react';
import { Home, BarChart3, Bot, Settings, HelpCircle, LogOut, Users, MessageSquare, Menu, X, Store, CreditCard, ShoppingCart, Package, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarProps {
  clientId?: string;
}

export default function Sidebar({ clientId }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();
  const { toggleTheme, isDark } = useTheme();
  
  const navItems = [
    { icon: Home, label: 'Dashboard', href: clientId ? `/app/${clientId}/home` : '/app' },
    { icon: Bot, label: 'Bots', href: clientId ? `/app/${clientId}` : '/app' },
    { icon: Store, label: 'Marketplace', href: clientId ? `/app/${clientId}/marketplace` : '/app' },
    { icon: MessageSquare, label: 'Conversations', href: clientId ? `/app/${clientId}/conversations` : '/app' },
    { icon: Users, label: 'Users', href: clientId ? `/app/${clientId}/users` : '/app' },
    { icon: BarChart3, label: 'Analytics', href: clientId ? `/app/${clientId}/analytics` : '/app' },
    { icon: Package, label: 'Plans', href: clientId ? `/app/${clientId}/plans` : '/app' },
    { icon: CreditCard, label: 'Billing', href: clientId ? `/app/${clientId}/billing` : '/app' },
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
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-interactive text-foreground-inverse rounded-lg"
      >
        <Menu size={20} />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-16 bg-sidebar-bg flex-col items-center py-4 z-40 border-r border-sidebar-border">
      <div className="mb-8">
        <div className="w-10 h-10 bg-sidebar-text-active rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595.28 595.28" width="24" height="24" className="text-sidebar-bg">
            <path d="M188.63,447.14h-85.83c-16.82,0-30.55-13.4-31-30.22-.75-27.61-.24-68.5,7.16-98,12.21-48.62,47.21-109.73,109.35-142.66,52.76-27.97,105.14-29.01,142.87-30.07,17.5-.49,31.83,13.7,31.74,31.21-.09,16.39-.43,55.47.37,73.93,1.66,37.96,31.63,46.31,46.37,46.31,38.09,0,54.52-3.7,85.4-1.33,16.18,1.24,28.67,14.7,28.67,30.92v90.86c0,17.13-13.88,31.01-31.01,31.01h-90.06c-17.29,0-31.25-14.13-31.01-31.42.27-19.36.33-42.56-.65-53.79-2.01-23.01-11.59-65.84-64.59-66.04-53-.2-76.05,23.06-82.72,48.27-3.4,12.86-4.07,45.34-4.05,70.02.02,17.13-13.88,31.01-31.01,31.01Z" fill="currentColor"/>
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
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-12 h-12 flex items-center justify-center rounded-lg text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595.28 595.28" width="24" height="24" className="text-sidebar-bg">
                    <path d="M188.63,447.14h-85.83c-16.82,0-30.55-13.4-31-30.22-.75-27.61-.24-68.5,7.16-98,12.21-48.62,47.21-109.73,109.35-142.66,52.76-27.97,105.14-29.01,142.87-30.07,17.5-.49,31.83,13.7,31.74,31.21-.09,16.39-.43,55.47.37,73.93,1.66,37.96,31.63,46.31,46.37,46.31,38.09,0,54.52-3.7,85.4-1.33,16.18,1.24,28.67,14.7,28.67,30.92v90.86c0,17.13-13.88,31.01-31.01,31.01h-90.06c-17.29,0-31.25-14.13-31.01-31.42.27-19.36.33-42.56-.65-53.79-2.01-23.01-11.59-65.84-64.59-66.04-53-.2-76.05,23.06-82.72,48.27-3.4,12.86-4.07,45.34-4.05,70.02.02,17.13-13.88,31.01-31.01,31.01Z" fill="currentColor"/>
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
              {/* Theme Toggle for Mobile */}
              <button
                onClick={() => {
                  toggleTheme();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-item-hover transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>

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
            </div>
          </div>
        </div>
      )}
    </>
  );
}