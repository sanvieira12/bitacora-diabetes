import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { GlucoseTrendPoint } from '../../types';

interface GlucoseLineChartProps {
  data: GlucoseTrendPoint[];
  lowThreshold?: number;
  targetMin?: number;
  targetMax?: number;
  highThreshold?: number;
}

function GlassTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-night-950/85 px-3 py-2 shadow-glass backdrop-blur-xl">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p className="mt-1 text-sm font-bold text-text-primary">{payload[0].value}</p>
    </div>
  );
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
    date: `${d.date.slice(5)}${d.measurementTime ? ` ${d.measurementTime.slice(0, 5)}` : ''}`,
  }));

  return (
    <ResponsiveContainer width="100%" height={270}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="glucoseStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="55%" stopColor="#63b3ff" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>
          <linearGradient id="glucoseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#63b3ff" stopOpacity={0.24} />
            <stop offset="65%" stopColor="#63b3ff" stopOpacity={0.05} />
            <stop offset="100%" stopColor="#63b3ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#9ca9c6', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: '#9ca9c6', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          domain={[40, 350]}
        />
        <Tooltip content={<GlassTooltip />} cursor={{ stroke: 'rgba(147,197,253,0.22)', strokeWidth: 1 }} />
        <ReferenceLine y={lowThreshold} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: 'Baja', fill: '#fbbf24', fontSize: 10 }} />
        <ReferenceLine y={targetMin} stroke="#6ee7b7" strokeDasharray="4 4" />
        <ReferenceLine y={targetMax} stroke="#6ee7b7" strokeDasharray="4 4" label={{ value: 'Objetivo', fill: '#6ee7b7', fontSize: 10 }} />
        <ReferenceLine y={highThreshold} stroke="#fb7185" strokeDasharray="4 4" label={{ value: 'Alta', fill: '#fb7185', fontSize: 10 }} />
        <Area
          type="monotone"
          dataKey="glucoseBeforeSleep"
          stroke="url(#glucoseStroke)"
          strokeWidth={3}
          fill="url(#glucoseFill)"
          dot={{ fill: '#050816', stroke: '#93c5fd', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#63b3ff', stroke: '#dbeafe', strokeWidth: 2 }}
          animationDuration={900}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
