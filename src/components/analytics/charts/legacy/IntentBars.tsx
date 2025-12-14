'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChartWrapper } from '../common';

export interface IntentBarsProps {
  data: Array<{ intent: string; count: number }>;
}

export function IntentBars({ data }: IntentBarsProps) {
  return (
    <div className="card p-4 h-72">
      <ChartWrapper data={data} width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="intent" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="var(--brand)" />
        </BarChart>
      </ChartWrapper>
    </div>
  );
}
