import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CalendarRange, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { LoadingState, StateBlock } from '../components/ui/StateBlock';
import { GlucoseLineChart } from '../components/stats/GlucoseLineChart';
import { EpisodeBarChart } from '../components/stats/EpisodeBarChart';
import { staggerContainer, staggerItem } from '../components/visual/pageMotion';
import {
  getStatisticsSummary,
  getGlucoseTrend,
  getEpisodeFrequency,
  getFactors,
} from '../api/statistics';
import { today, nDaysAgo } from '../lib/dateUtils';
import type { FactorFrequency, GlucoseTrendPoint, EpisodeFrequencyPoint, StatisticsSummary } from '../types';

const RANGES = [
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: '90 días', days: 90 },
];

function KpiCard({ label, value, sub, tone = 'text-text-primary' }: { label: string; value: React.ReactNode; sub?: string; tone?: string }) {
  return (
    <motion.div variants={staggerItem}>
      <Card className="p-4">
        <p className={`text-2xl font-extrabold tracking-tight ${tone}`}>{value}</p>
        <p className="mt-1 text-xs font-medium text-text-secondary">{label}</p>
        {sub && <p className="mt-0.5 text-[11px] text-text-secondary/70">{sub}</p>}
      </Card>
    </motion.div>
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
  const [error, setError] = useState<string | null>(null);

  const fetchAll = (f: string, t: string) => {
    setLoading(true);
    setError(null);
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
      .catch((err: Error) => setError(err.message))
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
    <motion.div className="space-y-5" variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={staggerItem}>
        <PageHeader
          icon={<TrendingUp size={22} />}
          eyebrow="Tendencias"
          title="Estadísticas"
          description="Lectura móvil y sobria de patrones nocturnos, sin ruido de dashboard."
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
            <CalendarRange size={16} className="text-medicalBlue" />
            Período
          </div>
          <div className="grid grid-cols-4 gap-2 rounded-[1.4rem] border border-white/10 bg-white/5 p-1.5">
            {RANGES.map((r) => (
              <button
                key={r.days}
                type="button"
                onClick={() => selectRange(r.days)}
                className={`rounded-2xl px-2 py-2 text-sm font-semibold transition-all ${
                  activeRange === r.days && !customMode
                    ? 'bg-medicalBlue text-night-950 shadow-glowBlue'
                    : 'text-text-secondary hover:bg-white/10 hover:text-text-primary'
                }`}
              >
                {r.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCustomMode((v) => !v)}
              className={`rounded-2xl px-2 py-2 text-sm font-semibold transition-all ${
                customMode
                  ? 'bg-medicalBlue text-night-950 shadow-glowBlue'
                  : 'text-text-secondary hover:bg-white/10 hover:text-text-primary'
              }`}
            >
              Otro
            </button>
          </div>
          {customMode && (
            <motion.div
              className="mt-3 grid grid-cols-2 gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
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
            </motion.div>
          )}
        </Card>
      </motion.div>

      {loading ? (
        <LoadingState label="Calculando tendencias" />
      ) : error ? (
        <StateBlock
          tone="danger"
          title="No se pudieron cargar las estadísticas"
          description={error}
          actionLabel="Reintentar"
          onAction={() => fetchAll(from, to)}
        />
      ) : stats ? (
        <>
          <motion.div className="grid grid-cols-2 gap-3" variants={staggerContainer}>
            <KpiCard label="Noches registradas" value={stats.totalNights} tone="text-medicalBlue" />
            <KpiCard label="Episodios" value={stats.totalEpisodes} tone="text-severeRed" />
            <KpiCard label="Tasa de episodios" value={`${stats.episodeRate}%`} tone="text-alertAmber" />
            <KpiCard label="Glucosa promedio" value={`${stats.avgGlucoseBeforeSleep}`} sub="mg/dL antes de dormir" tone="text-calmGreen" />
            <KpiCard label="Glucosa mínima" value={stats.minGlucoseBeforeSleep} />
            <KpiCard label="Glucosa máxima" value={stats.maxGlucoseBeforeSleep} />
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-text-primary">Distribución de atención</h2>
                <Activity size={17} className="text-medicalBlue" />
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Óptimo', count: stats.nightsGreen, color: 'from-calmGreen to-medicalBlue' },
                  { label: 'Atención', count: stats.nightsYellow, color: 'from-alertAmber to-orange-400' },
                  { label: 'Urgente', count: stats.nightsRed, color: 'from-severeRed to-red-900' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-3">
                    <span className="text-xs text-text-secondary">{label}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${color}`}
                        initial={{ width: 0 }}
                        animate={{ width: stats.totalNights > 0 ? `${(count / stats.totalNights) * 100}%` : '0%' }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-right text-xs font-semibold text-text-primary">{count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {trend.length > 0 && (
            <motion.div variants={staggerItem}>
              <Card className="p-4">
                <div className="mb-3">
                  <h2 className="font-semibold text-text-primary">Tendencia de glucosa</h2>
                  <p className="mt-1 text-xs text-text-secondary">Lecturas antes de dormir con rangos clínicos de referencia.</p>
                </div>
                <GlucoseLineChart data={trend} />
              </Card>
            </motion.div>
          )}

          {frequency.length > 0 && (
            <motion.div variants={staggerItem}>
              <Card className="p-4">
                <div className="mb-3">
                  <h2 className="font-semibold text-text-primary">Frecuencia de episodios</h2>
                  <p className="mt-1 text-xs text-text-secondary">Vista sobria para detectar semanas con mayor carga.</p>
                </div>
                <EpisodeBarChart data={frequency} />
              </Card>
            </motion.div>
          )}

          {factors.length > 0 && (
            <motion.div variants={staggerItem}>
              <Card className="p-4">
                <h2 className="mb-3 font-semibold text-text-primary">Factores frecuentes</h2>
                <div className="space-y-3">
                  {factors.map((f) => (
                    <div key={f.factor} className="flex items-center justify-between gap-3">
                      <span className="min-w-0 flex-1 truncate text-sm text-text-secondary">{f.factor}</span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-medicalBlue to-calmGreen"
                          initial={{ width: 0 }}
                          animate={{ width: `${f.percentage}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-semibold text-text-primary">{f.percentage}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </>
      ) : null}
    </motion.div>
  );
}
