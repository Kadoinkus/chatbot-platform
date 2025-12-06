'use client';

/**
 * Analytics Chart Components
 *
 * Enterprise-level chart library built on Recharts.
 * All components are theme-aware, type-safe, and handle edge cases gracefully.
 *
 * Usage:
 *   import { TimeSeriesAreaChart, DonutChart, VerticalBarChart } from '@/components/analytics/charts';
 */

import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Legend, PieChart, Pie, Cell,
} from 'recharts';
import type { ContentType, TooltipProps } from 'recharts/types/component/Tooltip';
import { tooltipStyle } from '@/lib/chartStyles';
import { getChartColors, GREY } from '@/lib/chartColors';

// ============================================
// Safe Formatters (prevent runtime errors)
// ============================================

/**
 * Safe string formatter - handles null/undefined/non-string values
 */
export const safeString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

/**
 * Safe number formatter - handles null/undefined/non-number values
 */
export const safeNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/**
 * Safe date formatter for axis ticks
 */
export const formatAxisDate = (value: unknown): string => {
  const str = safeString(value);
  if (!str) return '';
  try {
    return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return str;
  }
};

/**
 * Safe currency formatter for axis ticks
 */
export const formatAxisCurrency = (value: unknown, decimals = 2): string => {
  return `€${safeNumber(value).toFixed(decimals)}`;
};

/**
 * Safe percent formatter for axis ticks
 */
export const formatAxisPercent = (value: unknown, decimals = 1): string => {
  return `${safeNumber(value).toFixed(decimals)}%`;
};

/**
 * Safe hour formatter (e.g., "14:00")
 */
export const formatAxisHour = (value: unknown): string => {
  return `${safeString(value)}:00`;
};

// ============================================
// Common Types
// ============================================

export interface BaseChartProps {
  height?: number | string;
  brandColor?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

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

export type ChartTooltipProps = TooltipProps<number, string>;
export type CustomTooltipContent = ContentType<number, string>;

// ============================================
// Time Series Area Chart (Stacked)
// ============================================

export interface TimeSeriesAreaChartProps extends BaseChartProps {
  data: TimeSeriesDataPoint[];
  series: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  stacked?: boolean;
}

export function TimeSeriesAreaChart({
  data,
  series,
  height = '100%',
  brandColor = '#6B7280',
  showGrid = true,
  showLegend = true,
  stacked = true,
}: TimeSeriesAreaChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-foreground-secondary h-full">
        No data available
      </div>
    );
  }

  const colors = getChartColors(brandColor, series.length);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
          tickFormatter={formatAxisDate}
        />
        <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
        <Tooltip
          {...tooltipStyle}
          labelFormatter={formatAxisDate}
        />
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
            stackId={stacked ? '1' : undefined}
            stroke={s.color || colors[index]}
            fill={s.color || colors[index]}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ============================================
// Simple Area Chart (Single Series)
// ============================================

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
  brandColor = '#6B7280',
  showGrid = true,
}: SimpleAreaChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-foreground-secondary h-full">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
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
    </ResponsiveContainer>
  );
}

// ============================================
// Stacked Area Chart (Multiple Series)
// ============================================

export interface StackedAreaChartProps extends BaseChartProps {
  data: TimeSeriesDataPoint[];
  series: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
  xAxisFormatter?: (value: unknown) => string;
}

export function StackedAreaChart({
  data,
  series,
  xAxisFormatter = formatAxisDate,
  height = '100%',
  brandColor = '#6B7280',
  showGrid = true,
  showLegend = true,
}: StackedAreaChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-foreground-secondary h-full">
        No data available
      </div>
    );
  }

  const colors = getChartColors(brandColor, series.length);

  return (
    <ResponsiveContainer width="100%" height={height}>
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
    </ResponsiveContainer>
  );
}

// ============================================
// Vertical Bar Chart
// ============================================

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
  brandColor = '#6B7280',
  showGrid = true,
  barRadius = [4, 4, 0, 0],
}: VerticalBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-foreground-secondary h-full">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
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
    </ResponsiveContainer>
  );
}

// ============================================
// Stacked Bar Chart
// ============================================

export interface StackedBarSeries {
  key: string;
  name: string;
  color?: string;
}

// Custom tooltip content type for Recharts compatibility
export interface StackedBarChartProps extends BaseChartProps {
  data: Array<{ [key: string]: string | number }>;
  series: StackedBarSeries[];
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
  brandColor = '#6B7280',
  showGrid = true,
  showLegend = true,
}: StackedBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-foreground-secondary h-full">
        No data available
      </div>
    );
  }

  const colors = getChartColors(brandColor, series.length);

  return (
    <ResponsiveContainer width="100%" height={height}>
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
    </ResponsiveContainer>
  );
}

// ============================================
// Horizontal Bar Chart
// ============================================

export interface HorizontalBarChartProps extends BaseChartProps {
  data: Array<{ [key: string]: string | number }>;
  dataKey?: string;
  nameKey?: string;
  nameFormatter?: (value: unknown) => string;
  yAxisWidth?: number;
}

export function HorizontalBarChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  nameFormatter = safeString,
  yAxisWidth = 120,
  height = '100%',
  brandColor = '#6B7280',
  showGrid = true,
}: HorizontalBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-foreground-secondary h-full">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical">
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />}
        <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
        <YAxis
          type="category"
          dataKey={nameKey}
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          tickFormatter={nameFormatter}
          width={yAxisWidth}
        />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={dataKey} fill={brandColor} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================
// Donut/Pie Chart
// ============================================

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
  brandColor = '#6B7280',
  showLegend = true,
  innerRadius = '40%',
  outerRadius = '65%',
  showLabels = false,
}: DonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-foreground-secondary h-full">
        No data available
      </div>
    );
  }

  const colors = getChartColors(brandColor, data.length);

  // Label renderer that handles recharts PieLabelProps
  const renderLabel = showLabels
    ? ({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`
    : undefined;

  return (
    <ResponsiveContainer width="100%" height={height}>
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
          {data.map((entry, index) => (
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
    </ResponsiveContainer>
  );
}

// ============================================
// Simple Pie Chart (no inner radius)
// ============================================

export function SimplePieChart({
  data,
  height = 280,
  brandColor = '#6B7280',
  showLegend = true,
  showLabels = true,
}: Omit<DonutChartProps, 'innerRadius' | 'outerRadius'>) {
  return (
    <DonutChart
      data={data}
      height={height}
      brandColor={brandColor}
      showLegend={showLegend}
      showLabels={showLabels}
      innerRadius={0}
      outerRadius={100}
    />
  );
}

// ============================================
// Sentiment Stacked Area Chart (specialized)
// ============================================

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
      brandColor={brandColor}
      showGrid={showGrid}
      showLegend={showLegend}
      stacked={true}
    />
  );
}

// ============================================
// Hourly Bar Chart (specialized)
// ============================================

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
  brandColor = '#6B7280',
  showGrid = true,
}: HourlyBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-foreground-secondary h-full">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
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
    </ResponsiveContainer>
  );
}

// ============================================
// Cost Chart (specialized for currency)
// ============================================

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
  brandColor = '#6B7280',
  showGrid = true,
}: CostBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-foreground-secondary h-full">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
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
    </ResponsiveContainer>
  );
}

// ============================================
// Sparkline (mini chart for KPI cards)
// ============================================

export interface SparklineProps {
  data: Array<{ value: number }>;
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = 'var(--brand)',
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ============================================
// Re-export legacy charts for backwards compatibility
// ============================================

export { UsageLine, IntentBars, MultiLineChart } from '../Charts';
