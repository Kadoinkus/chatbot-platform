'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export interface IntentBarsProps {
  data: Array<{ intent: string; count: number }>;
}

export function IntentBars({ data }: IntentBarsProps) {
  return (
    <div className="card p-4 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="intent" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="var(--brand)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
