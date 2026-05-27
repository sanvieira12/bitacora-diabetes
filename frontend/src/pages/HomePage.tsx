import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, BookOpen, BarChart2, Clock3, FileText, Moon, PlusCircle, ShieldAlert, Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AttentionBadge } from '../components/AttentionBadge';
import { LoadingState } from '../components/ui/StateBlock';
import { GlucoseOrb, type GlucoseOrbStatus } from '../components/visual/GlucoseOrb';
import { staggerContainer, staggerItem } from '../components/visual/pageMotion';
import { getNightRecords } from '../api/nightRecords';
import { getStatisticsSummary } from '../api/statistics';
import { getProgress } from '../api/progress';
import { formatDate, formatGlucoseValue } from '../lib/formatters';
import { nightRecordToMedicalStatus } from '../lib/medicalVisualState';
import { nDaysAgo, today } from '../lib/dateUtils';
import type { NightRecordSummary, ProgressData, StatisticsSummary } from '../types';

function getOrbStatus(record: NightRecordSummary | null): GlucoseOrbStatus {
  return nightRecordToMedicalStatus(record);
}

const statusCopy: Record<GlucoseOrbStatus, { eyebrow: string; title: string; body: string }> = {
  stable: {
    eyebrow: 'Estado nocturno',
    title: 'Rango tranquilo',
    body: 'Último registro dentro de un estado estable. Mantené la observación habitual.',
  },
  attention: {
    eyebrow: 'Estado nocturno',
    title: 'Atención suave',
    body: 'Hay señales para mirar con más cuidado esta noche, sin perder calma.',
  },
  severe: {
    eyebrow: 'Estado prioritario',
    title: 'Hipoglucemia severa',
    body: 'Registro crítico. Seguí el protocolo indicado y consultá atención médica si corresponde.',
  },
  unknown: {
    eyebrow: 'Estado nocturno',
    title: 'Sin registro reciente',
    body: 'Cuando registres una noche, GAGA va a mostrar acá el estado principal.',
  },
};

function MetricCard({ label, value, tone = 'text-text-primary' }: { label: string; value: string | number; tone?: string }) {
  return (
    <motion.div variants={staggerItem}>
      <Card className="p-4 text-center">
        <p className={`text-2xl font-extrabold tracking-tight ${tone}`}>{value}</p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary">{label}</p>
      </Card>
    </motion.div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lastRecord, setLastRecord] = useState<NightRecordSummary | null>(null);
  const [weekStats, setWeekStats] = useState<StatisticsSummary | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = nDaysAgo(7);
    const to = today();
    setLoading(true);
    Promise.all([
      getNightRecords({ page: 0, size: 1 }),
      getStatisticsSummary(from, to),
      getProgress(),
    ])
      .then(([records, stats, prog]) => {
        setLastRecord(records.data[0] ?? null);
        setWeekStats(stats);
        setProgress(prog);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [location.key]);

  const orbStatus = getOrbStatus(lastRecord);
  const copy = statusCopy[orbStatus];

  return (
    <motion.div
      className="space-y-5"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.section variants={staggerItem} className="pt-1">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 shadow-glowBlue">
            <Moon className="text-medicalBlue" size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">Buenas noches, Juana</p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={staggerItem} className="space-y-3">
        <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/registrar-episodio')}>
          <Zap size={20} className="mr-2 text-severeRed" />
          Registrar episodio
        </Button>
        <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/registrar-noche')}>
          <PlusCircle size={20} className="mr-2" />
          Registrar noche
        </Button>
        <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/registro-rapido')}>
          <Clock3 size={20} className="mr-2" />
          Registro rápido
        </Button>
      </motion.section>

      {loading ? (
        <LoadingState label="Sincronizando tu bitácora" />
      ) : (
        <>
          <motion.section variants={staggerItem}>
            <Card className="relative overflow-hidden p-5">
              <div className="absolute inset-x-10 top-4 h-28 rounded-full bg-medicalBlue/10 blur-3xl" />
              <div className="relative">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">{copy.eyebrow}</p>
                    <h2 className="mt-1 text-xl font-bold text-text-primary">{copy.title}</h2>
                  </div>
                  {lastRecord && <AttentionBadge level={lastRecord.attentionLevel} reasons={lastRecord.attentionReasons} size="sm" />}
                </div>
                <GlucoseOrb
                  value={lastRecord?.glucoseBeforeSleep}
                  status={orbStatus}
                  label={lastRecord ? 'Antes de dormir' : 'Esperando dato'}
                />
                <p className="mx-auto max-w-sm text-center text-sm leading-6 text-text-secondary">{copy.body}</p>
                {lastRecord && (
                  <button
                    type="button"
                    onClick={() => navigate(`/historial/${lastRecord.id}`)}
                    className="mx-auto mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-white/20"
                  >
                    Ver registro de {formatDate(lastRecord.date)}
                  </button>
                )}
              </div>
            </Card>
          </motion.section>

          <motion.section variants={staggerItem}>
            <div className="grid grid-cols-3 gap-3">
              <MetricCard label="Noches" value={progress?.totalNights ?? weekStats?.totalNights ?? 0} tone="text-medicalBlue" />
              <MetricCard label="Episodios" value={weekStats?.totalEpisodes ?? 0} tone="text-severeRed" />
              <MetricCard label="Estables" value={weekStats?.nightsGreen ?? 0} tone="text-calmGreen" />
            </div>
          </motion.section>

          {lastRecord && (
            <motion.section variants={staggerItem}>
              <Card className="p-5">
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-medicalBlue">
                    {orbStatus === 'severe' ? <ShieldAlert size={22} /> : <Activity size={22} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-text-secondary">Último registro</p>
                        <p className="mt-1 text-lg font-bold text-text-primary">{formatGlucoseValue(lastRecord.glucoseBeforeSleep)}</p>
                      </div>
                      {lastRecord.hasEpisodes && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-severeRed/30 bg-severeRed/10 px-2.5 py-1 text-xs font-semibold text-severeRed">
                          <Zap size={12} /> Episodio
                        </span>
                      )}
                    </div>
                    {lastRecord.notes && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-secondary">{lastRecord.notes}</p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.section>
          )}

          <motion.section variants={staggerItem}>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="ghost" size="md" className="h-20 flex-col gap-1" onClick={() => navigate('/historial')}>
                <BookOpen size={20} />
                <span className="text-xs">Historial</span>
              </Button>
              <Button variant="ghost" size="md" className="h-20 flex-col gap-1" onClick={() => navigate('/estadisticas')}>
                <BarChart2 size={20} />
                <span className="text-xs">Datos</span>
              </Button>
              <Button variant="ghost" size="md" className="h-20 flex-col gap-1" onClick={() => navigate('/informe')}>
                <FileText size={20} />
                <span className="text-xs">Informe</span>
              </Button>
            </div>
          </motion.section>
        </>
      )}
    </motion.div>
  );
}
