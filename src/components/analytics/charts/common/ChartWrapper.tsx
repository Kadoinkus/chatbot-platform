'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';
import type { ResponsiveSize } from './types';

interface ChartWrapperProps {
  data: unknown[] | undefined;
  width?: ResponsiveSize;
  height?: ResponsiveSize;
  /** Ensures charts render even if parent has no explicit height */
  minHeight?: number;
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
  minHeight = 240,
  children,
}: ChartWrapperProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      if (w > 0 && h > 0) setSize({ width: w, height: h });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-foreground-secondary h-full">
        No data available
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight, minWidth: 0 }}>
      {size.width > 0 && size.height > 0 && (
        <ResponsiveContainer
          width={typeof width === 'number' ? width : size.width}
          height={typeof height === 'number' ? height : size.height}
          minHeight={minHeight}
          minWidth={0}
        >
          {children}
        </ResponsiveContainer>
      )}
    </div>
  );
}
