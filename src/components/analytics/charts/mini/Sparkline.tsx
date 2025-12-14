'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { ResponsiveSize } from '../common';

export interface SparklineProps {
  data: Array<{ value: number }>;
  width?: ResponsiveSize;
  height?: ResponsiveSize;
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
