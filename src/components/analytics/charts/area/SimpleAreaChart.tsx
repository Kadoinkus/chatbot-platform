'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { tooltipStyle } from '@/lib/chartStyles';
import { ChartWrapper, formatAxisDate } from '../common';
import type { BaseChartProps } from '../common';

export interface SimpleAreaChartProps extends BaseChartProps {
  data: Array<{ [key: string]: string | number }>;
  dataKey?: string;
  xAxisKey?: string;
  xAxisFormatter?: (value: unknown) => string;
}

export function SimpleAreaChart({
  data,
  dataKey = 'value',
  xAxisKey = 'date',
  xAxisFormatter = formatAxisDate,
  height = '100%',
  width = '100%',
  brandColor = '#6B7280',
  showGrid = true,
}: SimpleAreaChartProps) {
  return (
    <ChartWrapper data={data} width={width} height={height}>
      <AreaChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
          tickFormatter={xAxisFormatter}
        />
        <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
        <Tooltip {...tooltipStyle} labelFormatter={xAxisFormatter} />
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={brandColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={brandColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={brandColor}
          strokeWidth={2}
          fill={`url(#gradient-${dataKey})`}
        />
      </AreaChart>
    </ChartWrapper>
  );
}
