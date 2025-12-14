'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { tooltipStyle } from '@/lib/chartStyles';
import { ChartWrapper, formatAxisHour, safeString } from '../common';
import type { BaseChartProps } from '../common';

export interface HourlyDataPoint {
  hour: number;
  count: number;
}

export interface HourlyBarChartProps extends BaseChartProps {
  data: HourlyDataPoint[];
  dataKey?: string;
}

export function HourlyBarChart({
  data,
  dataKey = 'count',
  height = '100%',
  width = '100%',
  brandColor = '#6B7280',
  showGrid = true,
}: HourlyBarChartProps) {
  return (
    <ChartWrapper data={data} width={width} height={height}>
      <BarChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          tickFormatter={formatAxisHour}
        />
        <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
        <Tooltip
          {...tooltipStyle}
          labelFormatter={(value) => `${safeString(value)}:00 - ${safeString(value)}:59`}
        />
        <Bar dataKey={dataKey} fill={brandColor} radius={[4, 4, 0, 0]} name="Sessions" />
      </BarChart>
    </ChartWrapper>
  );
}
