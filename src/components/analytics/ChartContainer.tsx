'use client';

import { type ReactNode } from 'react';
import { Card } from '@/components/ui';
import { useResponsiveValue } from '@/lib/hooks/useMediaQuery';

type ChartSize = 'sm' | 'md' | 'lg';

interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  size?: ChartSize;
  height?: number | { base: number; sm?: number; md?: number; lg?: number };
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
}

/**
 * Predefined responsive heights for different chart sizes
 */
const CHART_HEIGHTS: Record<ChartSize, { base: number; sm: number; lg: number }> = {
  sm: { base: 180, sm: 200, lg: 220 },
  md: { base: 200, sm: 240, lg: 280 },
  lg: { base: 220, sm: 280, lg: 320 },
};

/**
 * Responsive chart container component
 * - Handles responsive chart heights
 * - Provides consistent card styling
 * - Supports column spanning for grid layouts
 */
export function ChartContainer({
  title,
  subtitle,
  size = 'md',
  height,
  children,
  className = '',
  colSpan = 1,
}: ChartContainerProps) {
  // Calculate responsive height
  const responsiveHeight = useResponsiveValue(
    typeof height === 'object'
      ? height
      : height
        ? { base: height, sm: height, lg: height }
        : CHART_HEIGHTS[size]
  );

  // Column span classes
  const colSpanClasses = {
    1: '',
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
  };

  return (
    <Card className={`${colSpanClasses[colSpan]} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="font-semibold text-foreground">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-foreground-secondary mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div style={{ height: responsiveHeight }}>
        {children}
      </div>
    </Card>
  );
}

/**
 * Responsive chart grid container
 * - Mobile: 1 column
 * - Desktop: Configurable columns (default 2)
 */
interface ChartGridProps {
  children: ReactNode;
  cols?: 2 | 3;
  className?: string;
}

export function ChartGrid({ children, cols = 2, className = '' }: ChartGridProps) {
  const colClasses = {
    2: 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6',
    3: 'grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6',
  };

  return (
    <div className={`${colClasses[cols]} ${className}`}>
      {children}
    </div>
  );
}

export default ChartContainer;
