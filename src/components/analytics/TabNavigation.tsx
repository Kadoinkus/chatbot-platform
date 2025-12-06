'use client';

import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  brandColor: string;
}

/**
 * Shared tab navigation component
 * - Mobile: Dropdown selector with brand color border
 * - Desktop: Horizontal tabs in a card
 */
export function TabNavigation({ tabs, activeTab, onTabChange, brandColor }: TabNavigationProps) {
  return (
    <>
      {/* Mobile: Dropdown selector */}
      <div className="lg:hidden mb-6">
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value)}
          className="w-full p-3 rounded-lg border border-border bg-surface text-foreground font-medium"
          style={{ borderColor: brandColor }}
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: Horizontal tabs */}
      <Card className="mb-6 p-0 hidden lg:block">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-interactive text-foreground'
                      : 'border-transparent text-foreground-tertiary hover:text-foreground-secondary hover:border-border'
                  }`}
                  style={activeTab === tab.id ? { borderBottomColor: brandColor } : {}}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </Card>
    </>
  );
}

export default TabNavigation;
