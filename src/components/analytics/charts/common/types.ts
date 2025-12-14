import type { ContentType, TooltipProps } from 'recharts/types/component/Tooltip';

// Shared type for dimensions passed to ResponsiveContainer (numbers or percentage strings)
export type ResponsiveSize = number | `${number}%`;

// ============================================
// Base Chart Props
// ============================================

export interface BaseChartProps {
  width?: ResponsiveSize;
  height?: ResponsiveSize;
  brandColor?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

// ============================================
// Data Point Types
// ============================================

export interface TimeSeriesDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface CategoryDataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

export interface NameValuePair {
  name: string;
  value: number;
  [key: string]: string | number;
}

// ============================================
// Tooltip Types
// ============================================

export type ChartTooltipProps = TooltipProps<number, string>;
export type CustomTooltipContent = ContentType<number, string>;

// ============================================
// Series Configuration
// ============================================

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
}
