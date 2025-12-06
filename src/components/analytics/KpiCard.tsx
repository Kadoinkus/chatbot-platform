'use client';

import { type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui';

interface KpiCardProps {
  icon?: LucideIcon;
  label: string;
  value?: string | number;
  subtitle?: string;
  valueColor?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Responsive KPI Card component
 * - Desktop (lg+): Compact card in 4-column grid
 * - Mobile: Full-width card with larger touch targets
 * - Supports custom children for complex content (e.g., sentiment icons)
 */
export function KpiCard({
  icon: Icon,
  label,
  value,
  subtitle,
  valueColor,
  className = '',
  children,
}: KpiCardProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-2 text-foreground-secondary mb-2">
        {Icon && <Icon size={16} className="shrink-0" />}
        <span className="text-xs sm:text-sm truncate">{label}</span>
      </div>
      {children ? (
        children
      ) : (
        <>
          <p
            className="text-xl sm:text-2xl font-bold text-foreground truncate"
            style={valueColor ? { color: valueColor } : undefined}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-foreground-tertiary mt-1 truncate hidden sm:block">{subtitle}</p>
          )}
        </>
      )}
    </Card>
  );
}

interface KpiGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive KPI Grid container
 * - Mobile: 2 columns
 * - Desktop (1024px+): 4 columns
 */
export function KpiGrid({ children, className = '' }: KpiGridProps) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`}>
      {children}
    </div>
  );
}

export default KpiCard;
