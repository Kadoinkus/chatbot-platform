'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
export function UsageLine({ data }:{ data: Array<{ date: string; conversations: number; resolved: number }> }) {
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
export function IntentBars({ data }:{ data: Array<{ intent: string; count: number }> }) {
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

export function MultiLineChart({
  data,
  series,
  xAxisKey = 'date',
  yAxisLabel,
  height = '100%',
  colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316']
}: {
  data: Array<any>;
  series: Array<{ name: string; dataKey: string }>;
  xAxisKey?: string;
  yAxisLabel?: string;
  height?: number | `${number}%`;
  colors?: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
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
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
    </ResponsiveContainer>
  );
}
