'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { tooltipStyle } from '@/lib/chartTooltip';
import { ChartWrapper, formatAxisDate, formatAxisCurrency } from '../common';
import type { BaseChartProps } from '../common';

export interface CostDataPoint {
  date: string;
  cost: number;
}

export interface CostBarChartProps extends BaseChartProps {
  data: CostDataPoint[];
  dataKey?: string;
}

export function CostBarChart({
  data,
  dataKey = 'cost',
  height = '100%',
  width = '100%',
  brandColor = '#6B7280',
  showGrid = true,
}: CostBarChartProps) {
  return (
    <ChartWrapper data={data} width={width} height={height}>
      <BarChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          tickFormatter={formatAxisDate}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
          tickFormatter={(v) => formatAxisCurrency(v, 3)}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(value) => [formatAxisCurrency(value, 4), 'Cost']}
          labelFormatter={formatAxisDate}
        />
        <Bar dataKey={dataKey} fill={brandColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartWrapper>
  );
}
