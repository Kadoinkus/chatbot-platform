'use client';

import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Legend, PieChart, Pie, Cell, ComposedChart,
} from 'recharts';

// ============================================
// Shared Tooltip Style (theme-aware)
// ============================================
const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--surface-elevated)',
    border: '1px solid var(--border-primary)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-md)',
    color: 'var(--text-primary)',
  },
  labelStyle: {
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
};

// ============================================
// Area Chart
// ============================================
export function AreaChartComponent({
  data,
  dataKey = 'value',
  xAxisKey = 'date',
  height = 300,
  showGrid = true,
}: {
  data: Array<{ [key: string]: string | number }>;
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />}
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
          stroke="var(--border-primary)"
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
          stroke="var(--border-primary)"
        />
        <Tooltip {...tooltipStyle} />
        <defs>
          <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="var(--brand)"
          strokeWidth={2}
          fill="url(#brandGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ============================================
// Donut Chart
// ============================================
export function DonutChart({
  data,
  height = 250,
  innerRadius = 60,
  outerRadius = 90,
  showLegend = true,
}: {
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
}) {
  // Default colors: brand, brandDark, then grays
  const defaultColors = [
    'var(--brand)',
    'var(--brandDark)',
    '#6B7280',
    '#9CA3AF',
    '#D1D5DB',
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || defaultColors[index % defaultColors.length]}
            />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
}

// ============================================
// Horizontal Bar Chart
// ============================================
export function HorizontalBarChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  showValues = true,
}: {
  data: Array<{ [key: string]: string | number }>;
  dataKey?: string;
  nameKey?: string;
  height?: number;
  showValues?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} stroke="var(--border-primary)" />
        <YAxis
          type="category"
          dataKey={nameKey}
          tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
          stroke="var(--border-primary)"
          width={100}
        />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={dataKey} fill="var(--brand)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============================================
// Stacked Area Chart
// ============================================
export function StackedAreaChart({
  data,
  keys,
  colors,
  xAxisKey = 'date',
  height = 300,
}: {
  data: Array<{ [key: string]: string | number }>;
  keys: string[];
  colors?: Record<string, string>;
  xAxisKey?: string;
  height?: number;
}) {
  const defaultColors: Record<string, string> = {
    [keys[0]]: 'var(--brand)',
    [keys[1]]: 'var(--brandDark)',
    [keys[2]]: '#6B7280',
  };

  const colorMap = colors || defaultColors;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
          stroke="var(--border-primary)"
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
          stroke="var(--border-primary)"
        />
        <Tooltip {...tooltipStyle} />
        <Legend />
        {keys.map((key) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stackId="1"
            stroke={colorMap[key] || 'var(--brand)'}
            fill={colorMap[key] || 'var(--brand)'}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ============================================
// Combo Chart (Bar + Line)
// ============================================
export function ComboChart({
  data,
  barKey,
  lineKey,
  xAxisKey = 'date',
  height = 300,
  barLabel,
  lineLabel,
}: {
  data: Array<{ [key: string]: string | number }>;
  barKey: string;
  lineKey: string;
  xAxisKey?: string;
  height?: number;
  barLabel?: string;
  lineLabel?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
          stroke="var(--border-primary)"
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
          stroke="var(--border-primary)"
        />
        <Tooltip {...tooltipStyle} />
        <Legend />
        <Bar
          dataKey={barKey}
          name={barLabel || barKey}
          fill="var(--brand)"
          radius={[4, 4, 0, 0]}
        />
        <Line
          type="monotone"
          dataKey={lineKey}
          name={lineLabel || lineKey}
          stroke="var(--brandDark)"
          strokeWidth={2}
          dot={{ fill: 'var(--brandDark)', r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ============================================
// Sparkline (mini chart for metric cards)
// ============================================
export function Sparkline({
  data,
  dataKey = 'value',
  width = 100,
  height = 30,
  color = 'var(--brand)',
}: {
  data: Array<{ [key: string]: number }>;
  dataKey?: string;
  width?: number;
  height?: number;
  color?: string;
}) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ============================================
// Re-export existing charts for convenience
// ============================================
export { UsageLine, IntentBars, MultiLineChart } from '../Charts';
