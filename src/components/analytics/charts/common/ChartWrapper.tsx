'use client';

import type { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';
import type { ResponsiveSize } from './types';

interface ChartWrapperProps {
  data: unknown[] | undefined;
  width?: ResponsiveSize;
  height?: ResponsiveSize;
  children: ReactElement;
}

/**
 * Wraps charts with ResponsiveContainer and handles empty data state.
 *
 * Charts should NOT use ResponsiveContainer directly - they render their
 * core chart element (AreaChart, BarChart, etc.) as children of this wrapper.
 */
export function ChartWrapper({
  data,
  width = '100%',
  height = '100%',
  children,
}: ChartWrapperProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-foreground-secondary h-full">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      {children}
    </ResponsiveContainer>
  );
}
