import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { EpisodeFrequencyPoint } from '../../types';

interface EpisodeBarChartProps {
  data: EpisodeFrequencyPoint[];
}

export function EpisodeBarChart({ data }: EpisodeBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4a" />
        <XAxis
          dataKey="period"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#2a3a4a' }}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#2a3a4a' }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a2332',
            border: '1px solid #2a3a4a',
            borderRadius: '12px',
            color: '#e2e8f0',
          }}
          formatter={(value: number) => [value, 'Episodios']}
        />
        <Bar dataKey="count" fill="#f87171" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
