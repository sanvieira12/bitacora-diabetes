import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { GlucoseTrendPoint } from '../../types';

interface GlucoseLineChartProps {
  data: GlucoseTrendPoint[];
  lowThreshold?: number;
  targetMin?: number;
  targetMax?: number;
  highThreshold?: number;
}

export function GlucoseLineChart({
  data,
  lowThreshold = 100,
  targetMin = 110,
  targetMax = 180,
  highThreshold = 270,
}: GlucoseLineChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    date: d.date.slice(5), // show MM-DD
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4a" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#2a3a4a' }}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#2a3a4a' }}
          domain={[40, 350]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a2332',
            border: '1px solid #2a3a4a',
            borderRadius: '12px',
            color: '#e2e8f0',
          }}
          formatter={(value: number) => [`${value} mg/dL`, 'Glucosa']}
        />
        {/* Reference lines for thresholds */}
        <ReferenceLine y={lowThreshold} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: 'Baja', fill: '#fbbf24', fontSize: 10 }} />
        <ReferenceLine y={targetMin} stroke="#4ade80" strokeDasharray="4 4" />
        <ReferenceLine y={targetMax} stroke="#4ade80" strokeDasharray="4 4" label={{ value: 'Rango objetivo', fill: '#4ade80', fontSize: 10 }} />
        <ReferenceLine y={highThreshold} stroke="#f87171" strokeDasharray="4 4" label={{ value: 'Alta', fill: '#f87171', fontSize: 10 }} />
        <Line
          type="monotone"
          dataKey="glucoseBeforeSleep"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6, fill: '#60a5fa' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
