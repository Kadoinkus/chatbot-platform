'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { tooltipStyle } from '@/lib/chartStyles';
import { ChartWrapper, safeString } from '../common';
import type { BaseChartProps } from '../common';

export interface VerticalBarChartProps extends BaseChartProps {
  data: Array<{ [key: string]: string | number }>;
  dataKey?: string;
  xAxisKey?: string;
  xAxisFormatter?: (value: unknown) => string;
  yAxisFormatter?: (value: unknown) => string;
  barRadius?: [number, number, number, number];
}

export function VerticalBarChart({
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  xAxisFormatter = safeString,
  yAxisFormatter,
  height = '100%',
  width = '100%',
  brandColor = '#6B7280',
  showGrid = true,
  barRadius = [4, 4, 0, 0],
}: VerticalBarChartProps) {
  return (
    <ChartWrapper data={data} width={width} height={height}>
      <BarChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          tickFormatter={xAxisFormatter}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
          tickFormatter={yAxisFormatter}
        />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={dataKey} fill={brandColor} radius={barRadius} />
      </BarChart>
    </ChartWrapper>
  );
}
