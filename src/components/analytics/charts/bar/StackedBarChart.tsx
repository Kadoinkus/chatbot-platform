'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { tooltipStyle } from '@/lib/chartTooltip';
import { getChartColors } from '@/lib/chartColors';
import { ChartWrapper, safeString } from '../common';
import type { BaseChartProps, CustomTooltipContent, ChartSeries } from '../common';

export interface StackedBarChartProps extends BaseChartProps {
  data: Array<{ [key: string]: string | number }>;
  series: ChartSeries[];
  xAxisKey?: string;
  xAxisFormatter?: (value: unknown) => string;
  yAxisFormatter?: (value: unknown) => string;
  customTooltip?: CustomTooltipContent;
}

export function StackedBarChart({
  data,
  series,
  xAxisKey = 'name',
  xAxisFormatter = safeString,
  yAxisFormatter,
  customTooltip,
  height = '100%',
  width = '100%',
  brandColor = '#6B7280',
  showGrid = true,
  showLegend = true,
}: StackedBarChartProps) {
  const colors = getChartColors(brandColor, series.length);

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
        {customTooltip ? (
          <Tooltip content={customTooltip} />
        ) : (
          <Tooltip {...tooltipStyle} />
        )}
        {showLegend && (
          <Legend
            formatter={(value) => <span style={{ color: 'var(--text-primary)' }}>{value}</span>}
          />
        )}
        {series.map((s, index) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            stackId="stack"
            fill={s.color || colors[index]}
            radius={index === series.length - 1 ? [4, 4, 0, 0] : undefined}
          />
        ))}
      </BarChart>
    </ChartWrapper>
  );
}
