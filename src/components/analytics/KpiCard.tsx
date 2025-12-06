'use client';

import { type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  valueColor?: string;
  className?: string;
}

/**
 * Responsive KPI Card component
 * - Desktop (lg+): Compact card in 4-column grid
 * - Mobile: Full-width card with larger touch targets
 */
export function KpiCard({
  icon: Icon,
  label,
  value,
  subtitle,
  valueColor,
  className = '',
}: KpiCardProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-2 text-foreground-secondary mb-2">
        <Icon size={16} className="shrink-0" />
        <span className="text-sm truncate">{label}</span>
      </div>
      <p
        className="text-2xl font-bold text-foreground truncate"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-foreground-tertiary mt-1 truncate">{subtitle}</p>
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
 * - Mobile (< 640px): 1 column
 * - Tablet (640px+): 2 columns
 * - Desktop (1024px+): 4 columns
 */
export function KpiGrid({ children, className = '' }: KpiGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`}>
      {children}
    </div>
  );
}

export default KpiCard;
