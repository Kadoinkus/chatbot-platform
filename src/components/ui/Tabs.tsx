'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs component');
  }
  return context;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

export interface TabsProps {
  /** Tab items */
  tabs: TabItem[];
  /** Default active tab */
  defaultTab?: string;
  /** Controlled active tab */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Tab content mapping */
  children?: ReactNode;
  /** Additional classes for tabs container */
  className?: string;
}

export interface TabPanelProps {
  /** Tab ID this panel belongs to */
  tabId: string;
  children: ReactNode;
  className?: string;
}

/**
 * Tabs component for tabbed navigation
 *
 * @example
 * const tabs = [
 *   { id: 'overview', label: 'Overview', icon: BarChart3 },
 *   { id: 'settings', label: 'Settings', icon: Settings },
 * ];
 *
 * <Tabs tabs={tabs} defaultTab="overview">
 *   <TabPanel tabId="overview">Overview content</TabPanel>
 *   <TabPanel tabId="settings">Settings content</TabPanel>
 * </Tabs>
 */
export function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  children,
  className,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs[0]?.id || ''
  );

  const activeTab = controlledActiveTab ?? internalActiveTab;

  const setActiveTab = (id: string) => {
    if (!controlledActiveTab) {
      setInternalActiveTab(id);
    }
    onTabChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>
        {/* Tab List */}
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8" role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  disabled={tab.disabled}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    isActive
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-foreground-tertiary hover:text-foreground-secondary hover:border-border-secondary',
                    tab.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {Icon && (
                    <Icon
                      size={20}
                      className={cn(
                        'mr-2',
                        isActive
                          ? 'text-foreground'
                          : 'text-foreground-tertiary group-hover:text-foreground-secondary'
                      )}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Panels */}
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/**
 * Tab panel component - renders content for a specific tab
 */
export function TabPanel({ tabId, children, className }: TabPanelProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== tabId) {
    return null;
  }

  return (
    <div
      id={`tabpanel-${tabId}`}
      role="tabpanel"
      aria-labelledby={`tab-${tabId}`}
      className={cn('mt-6', className)}
    >
      {children}
    </div>
  );
}

export default Tabs;
