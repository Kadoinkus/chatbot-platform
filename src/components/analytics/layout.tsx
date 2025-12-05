'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ============================================
// Section (collapsible container)
// ============================================
export function Section({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`mb-6 lg:mb-8 ${className}`}>
      {title && (
        <div
          className={`flex items-center justify-between mb-4 ${collapsible ? 'cursor-pointer' : ''}`}
          onClick={() => collapsible && setCollapsed(!collapsed)}
        >
          <div>
            <h3 className="section-title mb-0">{title}</h3>
            {description && (
              <p className="text-sm text-foreground-secondary mt-1">{description}</p>
            )}
          </div>
          {collapsible && (
            <button className="btn-ghost p-1">
              {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          )}
        </div>
      )}
      {!collapsed && children}
    </div>
  );
}

// ============================================
// Grid Layout
// ============================================
export function Grid({
  children,
  cols = 2,
  gap = 4,
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 2 | 4 | 6;
}) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
  };

  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]}`}>
      {children}
    </div>
  );
}

// ============================================
// Tab Container
// ============================================
export function TabContainer({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <div className="border-b border-border mb-6">
      <nav className="flex gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={activeTab === tab.id ? 'tab-active' : 'tab'}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ============================================
// Card with Title
// ============================================
export function ChartCard({
  title,
  description,
  children,
  action,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-4 lg:p-6">
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h4 className="font-medium text-foreground">{title}</h4>}
            {description && (
              <p className="text-sm text-foreground-secondary mt-1">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================
// Empty State
// ============================================
export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {action}
    </div>
  );
}

// ============================================
// Loading Skeleton
// ============================================
export function Skeleton({
  className = '',
  variant = 'text',
}: {
  className?: string;
  variant?: 'text' | 'chart' | 'card';
}) {
  const variantClasses = {
    text: 'h-4 w-24',
    chart: 'h-64 w-full',
    card: 'h-32 w-full',
  };

  return (
    <div
      className={`animate-pulse bg-background-tertiary rounded ${variantClasses[variant]} ${className}`}
    />
  );
}

// ============================================
// Date Range Selector
// ============================================
export function DateRangeSelector({
  value,
  onChange,
  options = ['last_7_days', 'last_30_days', 'last_90_days'],
}: {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
}) {
  const labels: Record<string, string> = {
    today: 'Today',
    last_7_days: 'Last 7 days',
    last_30_days: 'Last 30 days',
    last_90_days: 'Last 90 days',
    custom: 'Custom',
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="select w-auto"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {labels[opt] || opt}
        </option>
      ))}
    </select>
  );
}
