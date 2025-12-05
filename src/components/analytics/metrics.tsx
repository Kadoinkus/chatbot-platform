'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Sparkline } from './charts';
import { formatValue } from './utils';

// ============================================
// Big Number (KPI Card)
// ============================================
export function BigNumber({
  value,
  label,
  format = 'number',
  decimals = 0,
  prefix,
  suffix,
  comparison,
  goodDirection = 'up',
  sparklineData,
}: {
  value: number;
  label: string;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  decimals?: number;
  prefix?: string;
  suffix?: string;
  comparison?: { value: number; changePercent: number };
  goodDirection?: 'up' | 'down';
  sparklineData?: number[];
}) {
  const formattedValue = formatValue(value, format, { decimals });
  const displayValue = `${prefix || ''}${formattedValue}${suffix || ''}`;

  const getComparisonColor = () => {
    if (!comparison) return '';
    const isPositive = comparison.changePercent > 0;
    const isGood = goodDirection === 'up' ? isPositive : !isPositive;
    return isGood ? 'text-success-600' : 'text-error-600';
  };

  const getComparisonIcon = () => {
    if (!comparison) return null;
    if (comparison.changePercent > 0) return <TrendingUp size={14} />;
    if (comparison.changePercent < 0) return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-foreground-secondary">{label}</span>
      <div className="flex items-end gap-3">
        <span className="text-2xl font-semibold text-foreground">{displayValue}</span>
        {sparklineData && sparklineData.length > 0 && (
          <Sparkline data={sparklineData.map((v) => ({ value: v }))} />
        )}
      </div>
      {comparison && (
        <div className={`flex items-center gap-1 text-sm ${getComparisonColor()}`}>
          {getComparisonIcon()}
          <span>
            {comparison.changePercent > 0 ? '+' : ''}
            {comparison.changePercent.toFixed(1)}%
          </span>
          <span className="text-foreground-tertiary">vs prev period</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Metric Card (wrapper with card styling)
// ============================================
export function MetricCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card p-4 lg:p-6 ${className}`}>
      {children}
    </div>
  );
}

// ============================================
// Metric Grid (responsive grid for metrics)
// ============================================
export function MetricGrid({
  children,
  columns = 4,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 lg:gap-6`}>
      {children}
    </div>
  );
}

// ============================================
// Status Badge
// ============================================
export function StatusBadge({
  value,
  variant,
}: {
  value: string;
  variant?: 'positive' | 'negative' | 'neutral' | 'warning' | 'default';
}) {
  const variants = {
    positive: 'bg-success-50 text-success-700 dark:bg-success-700/20 dark:text-success-500',
    negative: 'bg-error-50 text-error-700 dark:bg-error-700/20 dark:text-error-500',
    warning: 'bg-warning-50 text-warning-700 dark:bg-warning-700/20 dark:text-warning-500',
    neutral: 'bg-background-tertiary text-foreground-secondary',
    default: 'bg-background-tertiary text-foreground-secondary',
  };

  // Auto-detect variant from value if not provided
  const autoVariant = (): 'positive' | 'negative' | 'neutral' | 'warning' | 'default' => {
    const lower = value.toLowerCase();
    if (['positive', 'resolved', 'completed', 'high'].includes(lower)) return 'positive';
    if (['negative', 'unresolved', 'abandoned', 'low'].includes(lower)) return 'negative';
    if (['partial', 'medium'].includes(lower)) return 'warning';
    if (['neutral', 'no_goal'].includes(lower)) return 'neutral';
    return 'default';
  };

  const finalVariant = variant || autoVariant();

  return (
    <span className={`badge ${variants[finalVariant]}`}>
      {value.replace(/_/g, ' ')}
    </span>
  );
}
