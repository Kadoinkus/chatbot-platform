'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { tooltipStyle } from '@/lib/chartStyles';
import { getChartColors } from '@/lib/chartColors';
import { ChartWrapper, formatAxisDate } from '../common';
import type { BaseChartProps, TimeSeriesDataPoint, ChartSeries } from '../common';

export interface StackedAreaChartProps extends BaseChartProps {
  data: TimeSeriesDataPoint[];
  series: ChartSeries[];
  xAxisFormatter?: (value: unknown) => string;
}

export function StackedAreaChart({
  data,
  series,
  xAxisFormatter = formatAxisDate,
  height = '100%',
  width = '100%',
  brandColor = '#6B7280',
  showGrid = true,
  showLegend = true,
}: StackedAreaChartProps) {
  const colors = getChartColors(brandColor, series.length);

  return (
    <ChartWrapper data={data} width={width} height={height}>
      <AreaChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
          tickFormatter={xAxisFormatter}
        />
        <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
        <Tooltip {...tooltipStyle} labelFormatter={xAxisFormatter} />
        {showLegend && (
          <Legend
            formatter={(value) => <span style={{ color: 'var(--text-primary)' }}>{value}</span>}
          />
        )}
        {series.map((s, index) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stackId="1"
            stroke={s.color || colors[index]}
            fill={s.color || colors[index]}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ChartWrapper>
  );
}
