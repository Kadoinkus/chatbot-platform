'use client';

import { DonutChart } from './DonutChart';
import type { DonutChartProps } from './DonutChart';

export function SimplePieChart({
  data,
  height = 280,
  width = '100%',
  brandColor = '#6B7280',
  showLegend = true,
  showLabels = true,
}: Omit<DonutChartProps, 'innerRadius' | 'outerRadius'>) {
  return (
    <DonutChart
      data={data}
      height={height}
      width={width}
      brandColor={brandColor}
      showLegend={showLegend}
      showLabels={showLabels}
      innerRadius={0}
      outerRadius={100}
    />
  );
}
