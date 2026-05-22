import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { GlucoseLineChart } from '../components/stats/GlucoseLineChart';
import { EpisodeBarChart } from '../components/stats/EpisodeBarChart';
import {
  getStatisticsSummary,
  getGlucoseTrend,
  getEpisodeFrequency,
  getFactors,
} from '../api/statistics';
import { today, nDaysAgo } from '../lib/dateUtils';
import type { StatisticsSummary, GlucoseTrendPoint, EpisodeFrequencyPoint, FactorFrequency } from '../types';

const RANGES = [
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: '90 días', days: 90 },
];

function KpiCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
      {sub && <p className="text-xs text-text-secondary">{sub}</p>}
    </Card>
  );
}

export function StatisticsPage() {
  const [customMode, setCustomMode] = useState(false);
  const [from, setFrom] = useState(nDaysAgo(30));
  const [to, setTo] = useState(today());
  const [activeRange, setActiveRange] = useState(30);

  const [stats, setStats] = useState<StatisticsSummary | null>(null);
  const [trend, setTrend] = useState<GlucoseTrendPoint[]>([]);
  const [frequency, setFrequency] = useState<EpisodeFrequencyPoint[]>([]);
  const [factors, setFactors] = useState<FactorFrequency[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = (f: string, t: string) => {
    setLoading(true);
    Promise.all([
      getStatisticsSummary(f, t),
      getGlucoseTrend(f, t),
      getEpisodeFrequency(f, t, 'week'),
      getFactors(f, t),
    ])
      .then(([s, tr, freq, fac]) => {
        setStats(s);
        setTrend(tr);
        setFrequency(freq);
        setFactors(fac);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll(from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectRange = (days: number) => {
    const f = nDaysAgo(days);
    const t = today();
    setFrom(f);
    setTo(t);
    setActiveRange(days);
    setCustomMode(false);
    fetchAll(f, t);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-text-primary">Estadísticas</h1>

      {/* Range selector */}
      <Card className="p-4 space-y-3">
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Button
              key={r.days}
              variant={activeRange === r.days && !customMode ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => selectRange(r.days)}
              className="flex-1"
            >
              {r.label}
            </Button>
          ))}
          <Button
            variant={customMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setCustomMode((v) => !v)}
            className="flex-1"
          >
            Otro
          </Button>
        </div>
        {customMode && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Desde" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input label="Hasta" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            <Button
              variant="primary"
              size="sm"
              className="col-span-2"
              onClick={() => { setActiveRange(0); fetchAll(from, to); }}
            >
              Aplicar
            </Button>
          </div>
        )}
      </Card>

      {loading ? (
        <LoadingSpinner className="py-12" />
      ) : stats ? (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="Noches registradas" value={stats.totalNights} />
            <KpiCard label="Episodios" value={<span className="text-red-400">{stats.totalEpisodes}</span>} />
            <KpiCard label="Tasa de episodios" value={`${stats.episodeRate}%`} />
            <KpiCard
              label="Glucosa promedio"
              value={`${stats.avgGlucoseBeforeSleep}`}
              sub="mg/dL antes de dormir"
            />
            <KpiCard label="Glucosa mínima" value={`${stats.minGlucoseBeforeSleep} mg/dL`} />
            <KpiCard label="Glucosa máxima" value={`${stats.maxGlucoseBeforeSleep} mg/dL`} />
          </div>

          {/* Attention distribution */}
          <Card className="p-4">
            <h2 className="font-semibold text-text-primary mb-3">Distribución de atención</h2>
            <div className="space-y-2">
              {[
                { label: 'Óptimo', count: stats.nightsGreen, color: 'bg-green-400' },
                { label: 'Atención', count: stats.nightsYellow, color: 'bg-yellow-400' },
                { label: 'Urgente', count: stats.nightsRed, color: 'bg-red-400' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary w-16">{label}</span>
                  <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${color}`}
                      style={{
                        width: stats.totalNights > 0
                          ? `${(count / stats.totalNights) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-text-primary w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Glucose trend chart */}
          {trend.length > 0 && (
            <Card className="p-4">
              <h2 className="font-semibold text-text-primary mb-3">Tendencia de glucosa</h2>
              <GlucoseLineChart data={trend} />
            </Card>
          )}

          {/* Episode frequency chart */}
          {frequency.length > 0 && (
            <Card className="p-4">
              <h2 className="font-semibold text-text-primary mb-3">Frecuencia de episodios</h2>
              <EpisodeBarChart data={frequency} />
            </Card>
          )}

          {/* Factors */}
          {factors.length > 0 && (
            <Card className="p-4">
              <h2 className="font-semibold text-text-primary mb-3">Factores</h2>
              <div className="space-y-3">
                {factors.map((f) => (
                  <div key={f.factor} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{f.factor}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-border rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-blue-500"
                          style={{ width: `${f.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-text-primary w-10 text-right">
                        {f.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
