'use client';

import { type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui';

type IconBgVariant = 'info' | 'success' | 'warning' | 'error' | 'premium';

interface KpiCardProps {
  icon?: LucideIcon;
  iconBg?: IconBgVariant;
  label: string;
  value?: string | number;
  subtitle?: string;
  valueColor?: string;
  className?: string;
  children?: React.ReactNode;
}

// Icon background styles for each variant
const iconBgStyles: Record<IconBgVariant, { bg: string; text: string }> = {
  info: {
    bg: 'bg-info-100 dark:bg-info-700/30',
    text: 'text-info-600 dark:text-info-500',
  },
  success: {
    bg: 'bg-success-100 dark:bg-success-700/30',
    text: 'text-success-600 dark:text-success-500',
  },
  warning: {
    bg: 'bg-warning-100 dark:bg-warning-700/30',
    text: 'text-warning-600 dark:text-warning-500',
  },
  error: {
    bg: 'bg-error-100 dark:bg-error-700/30',
    text: 'text-error-600 dark:text-error-500',
  },
  premium: {
    bg: 'bg-plan-premium-bg',
    text: 'text-plan-premium-text',
  },
};

/**
 * Responsive KPI Card component
 * - Desktop (lg+): Compact card in 4-column grid
 * - Mobile: Full-width card with larger touch targets
 * - Supports custom children for complex content (e.g., sentiment icons)
 * - Supports iconBg for colored icon backgrounds (info, success, warning, error, premium)
 */
export function KpiCard({
  icon: Icon,
  iconBg,
  label,
  value,
  subtitle,
  valueColor,
  className = '',
  children,
}: KpiCardProps) {
  const iconStyles = iconBg ? iconBgStyles[iconBg] : null;

  return (
    <Card className={`p-4 sm:p-6 ${className}`}>
      {/* Icon with optional colored background */}
      {Icon && iconStyles ? (
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`p-2 sm:p-3 rounded-lg ${iconStyles.bg}`}>
            <Icon size={20} className={`sm:w-6 sm:h-6 ${iconStyles.text}`} />
          </div>
        </div>
      ) : Icon ? (
        <div className="flex items-center gap-2 text-foreground-secondary mb-2">
          <Icon size={16} className="shrink-0" />
          <span className="text-xs sm:text-sm truncate">{label}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-foreground-secondary mb-2">
          <span className="text-xs sm:text-sm truncate">{label}</span>
        </div>
      )}

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
          {/* Show label below value when using iconBg style */}
          {iconStyles ? (
            <p className="text-xs sm:text-sm text-foreground-secondary mt-1">{label}</p>
          ) : subtitle ? (
            <p className="text-xs text-foreground-tertiary mt-1 truncate hidden sm:block">{subtitle}</p>
          ) : null}
          {/* Show subtitle when using iconBg style and subtitle exists */}
          {iconStyles && subtitle && (
            <p className="text-xs text-foreground-tertiary mt-0.5 truncate hidden sm:block">{subtitle}</p>
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
