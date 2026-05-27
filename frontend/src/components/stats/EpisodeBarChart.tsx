import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { EpisodeFrequencyPoint } from '../../types';

interface EpisodeBarChartProps {
  data: EpisodeFrequencyPoint[];
}

function GlassTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-night-950/85 px-3 py-2 shadow-glass backdrop-blur-xl">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p className="mt-1 text-sm font-bold text-text-primary">{payload[0].value} episodios</p>
    </div>
  );
}

export function EpisodeBarChart({ data }: EpisodeBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="episodeBars" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb7185" stopOpacity={0.92} />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity={0.62} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="period"
          tick={{ fill: '#9ca9c6', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: '#9ca9c6', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(251,113,133,0.08)' }} />
        <Bar dataKey="count" fill="url(#episodeBars)" radius={[10, 10, 4, 4]} animationDuration={850} />
      </BarChart>
    </ResponsiveContainer>
  );
}
