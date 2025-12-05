/**
 * Chart Style Utilities
 *
 * Provides consistent styling for Recharts components across the application.
 * All styles use CSS variables for theme-aware light/dark mode support.
 *
 * Usage:
 *   import { tooltipStyle, axisStyle, gridStyle, legendFormatter } from '@/lib/chartStyles';
 *
 *   <Tooltip {...tooltipStyle} />
 *   <XAxis {...axisStyle} />
 *   <CartesianGrid {...gridStyle} />
 *   <Legend formatter={legendFormatter} />
 */

import type { CSSProperties } from 'react';

/**
 * Theme-aware tooltip styling for Recharts
 * Ensures text is readable in both light and dark modes
 */
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--surface-elevated)',
    border: '1px solid var(--border-primary)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-md)',
    color: 'var(--text-primary)',
  } as CSSProperties,
  labelStyle: {
    color: 'var(--text-primary)',
    fontWeight: 500,
  } as CSSProperties,
  itemStyle: {
    color: 'var(--text-secondary)',
  } as CSSProperties,
};

/**
 * Theme-aware axis tick styling
 */
export const axisTickStyle = {
  fontSize: 12,
  fill: 'var(--text-secondary)',
};

/**
 * Smaller axis tick styling (for horizontal bar charts with long labels)
 */
export const axisTickStyleSmall = {
  fontSize: 11,
  fill: 'var(--text-secondary)',
};

/**
 * Theme-aware axis line/stroke color
 */
export const axisStrokeColor = 'var(--border-primary)';

/**
 * Theme-aware grid styling
 */
export const gridStyle = {
  strokeDasharray: '3 3',
  stroke: 'var(--border-primary)',
};

/**
 * Legend formatter that ensures text is readable regardless of segment color
 * Use this to prevent legend text from inheriting pie/donut segment colors
 *
 * @example
 * <Legend formatter={legendFormatter} />
 */
export const legendFormatter = (value: string) => {
  // Return JSX-compatible object for Recharts
  return { type: 'span', props: { style: { color: 'var(--text-primary)' }, children: value } };
};

/**
 * Create a legend formatter as a React element (for direct JSX usage)
 * Use this in components where you can use JSX directly
 *
 * @example
 * <Legend formatter={(value) => <span style={{ color: 'var(--text-primary)' }}>{value}</span>} />
 */
export const createLegendFormatter = () => {
  return (value: string) => {
    // This returns a plain object that Recharts can render
    return value;
  };
};

/**
 * Common XAxis props for date-based charts
 */
export const dateAxisProps = {
  dataKey: 'date',
  tick: axisTickStyle,
  stroke: axisStrokeColor,
  tickFormatter: (value: string) => {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },
};

/**
 * Common YAxis props
 */
export const valueAxisProps = {
  tick: axisTickStyle,
  stroke: axisStrokeColor,
};

/**
 * Currency formatter for axis ticks
 */
export const currencyTickFormatter = (value: number) => `€${value.toFixed(2)}`;

/**
 * Currency formatter for tooltip values
 */
export const currencyTooltipFormatter = (value: number | string) => {
  return [`€${Number(value).toFixed(4)}`, 'Cost'];
};

/**
 * Bar chart default radius (rounded top corners)
 */
export const barRadius: [number, number, number, number] = [4, 4, 0, 0];

/**
 * Horizontal bar chart default radius (rounded right corners)
 */
export const horizontalBarRadius: [number, number, number, number] = [0, 4, 4, 0];

/**
 * Area chart default fill opacity
 */
export const areaFillOpacity = 0.2;

/**
 * Default stroke width for lines and areas
 */
export const strokeWidth = 2;

/**
 * Pie/Donut chart default props
 */
export const pieChartDefaults = {
  cx: '50%',
  cy: '50%',
  paddingAngle: 2,
};

/**
 * Donut chart inner/outer radius
 */
export const donutRadius = {
  innerRadius: 60,
  outerRadius: 100,
};

/**
 * Standard chart heights
 */
export const chartHeight = {
  small: 200,
  medium: 280,
  large: 300,
  xlarge: 400,
};
