'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { ChartWrapper } from '../common';
import type { ResponsiveSize } from '../common';

export interface MultiLineChartSeries {
  name: string;
  dataKey: string;
}

export interface MultiLineChartProps {
  data: Array<Record<string, unknown>>;
  series: MultiLineChartSeries[];
  xAxisKey?: string;
  yAxisLabel?: string;
  height?: ResponsiveSize;
  colors?: string[];
}

const DEFAULT_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

export function MultiLineChart({
  data,
  series,
  xAxisKey = 'date',
  yAxisLabel,
  height = '100%',
  colors = DEFAULT_COLORS,
}: MultiLineChartProps) {
  return (
    <ChartWrapper data={data} width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Legend />
        {series.map((serie, index) => (
          <Line
            key={serie.dataKey}
            type="monotone"
            dataKey={serie.dataKey}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: colors[index % colors.length] }}
            name={serie.name}
          />
        ))}
      </LineChart>
    </ChartWrapper>
  );
}
