'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { tooltipStyle } from '@/lib/chartStyles';
import { ChartWrapper, safeString } from '../common';
import type { BaseChartProps } from '../common';

export interface HorizontalBarChartProps extends BaseChartProps {
  data: Array<{ [key: string]: string | number }>;
  dataKey?: string;
  nameKey?: string;
  nameFormatter?: (value: unknown) => string;
  yAxisWidth?: number;
}

export function HorizontalBarChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  nameFormatter = safeString,
  yAxisWidth = 120,
  height = '100%',
  width = '100%',
  brandColor = '#6B7280',
  showGrid = true,
}: HorizontalBarChartProps) {
  return (
    <ChartWrapper data={data} width={width} height={height}>
      <BarChart data={data} layout="vertical">
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />}
        <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
        <YAxis
          type="category"
          dataKey={nameKey}
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          tickFormatter={nameFormatter}
          width={yAxisWidth}
        />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={dataKey} fill={brandColor} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartWrapper>
  );
}
