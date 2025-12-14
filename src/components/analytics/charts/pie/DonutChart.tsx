'use client';

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { tooltipStyle } from '@/lib/chartStyles';
import { getChartColors } from '@/lib/chartColors';
import { ChartWrapper } from '../common';
import type { BaseChartProps, CategoryDataPoint } from '../common';

export interface DonutChartProps extends BaseChartProps {
  data: CategoryDataPoint[];
  innerRadius?: number | string;
  outerRadius?: number | string;
  showLabels?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({
  data,
  height = '100%',
  width = '100%',
  brandColor = '#6B7280',
  showLegend = true,
  innerRadius = '40%',
  outerRadius = '65%',
  showLabels = false,
}: DonutChartProps) {
  const colors = getChartColors(brandColor, data?.length || 0);

  // Label renderer that handles recharts PieLabelProps
  const renderLabel = showLabels
    ? ({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`
    : undefined;

  return (
    <ChartWrapper data={data} width={width} height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          label={renderLabel}
          labelLine={showLabels}
        >
          {data?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || colors[index]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        {showLegend && (
          <Legend
            formatter={(value) => <span style={{ color: 'var(--text-primary)' }}>{value}</span>}
          />
        )}
      </PieChart>
    </ChartWrapper>
  );
}
