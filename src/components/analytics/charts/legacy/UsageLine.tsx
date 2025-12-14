'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export interface UsageLineProps {
  data: Array<{ date: string; conversations: number; resolved: number }>;
}

export function UsageLine({ data }: UsageLineProps) {
  return (
    <div className="card p-4 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="conversations" stroke="var(--brand)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="resolved" stroke="var(--brandDark)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
