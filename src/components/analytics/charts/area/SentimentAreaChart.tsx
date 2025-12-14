'use client';

import { getChartColors } from '@/lib/chartColors';
import { TimeSeriesAreaChart } from './TimeSeriesAreaChart';
import type { BaseChartProps, TimeSeriesDataPoint } from '../common';

export interface SentimentDataPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentAreaChartProps extends BaseChartProps {
  data: SentimentDataPoint[];
}

export function SentimentAreaChart({
  data,
  height = '100%',
  width = '100%',
  brandColor = '#6B7280',
  showGrid = true,
  showLegend = true,
}: SentimentAreaChartProps) {
  const colors = getChartColors(brandColor, 3);

  // Cast data to TimeSeriesDataPoint[] for compatibility
  const chartData = data as unknown as TimeSeriesDataPoint[];

  return (
    <TimeSeriesAreaChart
      data={chartData}
      series={[
        { key: 'positive', name: 'Positive', color: colors[0] },
        { key: 'neutral', name: 'Neutral', color: colors[2] },
        { key: 'negative', name: 'Negative', color: colors[1] },
      ]}
      height={height}
      width={width}
      brandColor={brandColor}
      showGrid={showGrid}
      showLegend={showLegend}
      stacked={true}
    />
  );
}
