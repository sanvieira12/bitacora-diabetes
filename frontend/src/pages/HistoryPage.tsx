import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ChevronDown, Moon, Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AttentionBadge } from '../components/AttentionBadge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PageHeader } from '../components/ui/PageHeader';
import { LoadingState, StateBlock } from '../components/ui/StateBlock';
import { staggerContainer, staggerItem } from '../components/visual/pageMotion';
import { useNightRecords } from '../hooks/useNightRecords';
import { formatDate, formatGlucoseValue, formatTime } from '../lib/formatters';
import { today, nDaysAgo } from '../lib/dateUtils';
import type { AttentionLevel } from '../types';

const toneByLevel: Record<AttentionLevel, { dot: string; rail: string; text: string }> = {
  GREEN: { dot: 'bg-calmGreen shadow-[0_0_28px_rgba(110,231,183,0.44)]', rail: 'from-calmGreen/40', text: 'text-calmGreen' },
  YELLOW: { dot: 'bg-alertAmber shadow-[0_0_28px_rgba(251,191,36,0.38)]', rail: 'from-alertAmber/40', text: 'text-alertAmber' },
  RED: { dot: 'bg-severeRed shadow-[0_0_30px_rgba(251,113,133,0.42)]', rail: 'from-severeRed/45', text: 'text-severeRed' },
};

export function HistoryPage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState(nDaysAgo(30));
  const [to, setTo] = useState(today());
  const [hasEpisode, setHasEpisode] = useState<boolean | undefined>(undefined);
  const [attentionLevel, setAttentionLevel] = useState('');
  const [page, setPage] = useState(0);

  const { records, loading, error, page: pageMeta, refetch } = useNightRecords({
    from,
    to,
    hasEpisode,
    attentionLevel: attentionLevel || undefined,
    page,
    size: 20,
  });

  return (
    <motion.div className="space-y-5" variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={staggerItem}>
        <PageHeader
          icon={<BookOpen size={22} />}
          eyebrow="Timeline"
          title="Historial nocturno"
          description="Una cronología clara de tus noches, con prioridad visual según el estado."
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-text-primary">Filtros</h2>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-text-secondary">
              {pageMeta?.totalElements ?? records.length} registros
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Desde" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} />
            <Input label="Hasta" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} />
          </div>
          <div className="mt-3">
            <Select
              label="Nivel de atención"
              value={attentionLevel}
              onChange={(e) => { setAttentionLevel(e.target.value); setPage(0); }}
              options={[
                { value: '', label: 'Todos' },
                { value: 'GREEN', label: 'Óptimo' },
                { value: 'YELLOW', label: 'Atención' },
                { value: 'RED', label: 'Urgente' },
              ]}
            />
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-border bg-background accent-medicalBlue"
              checked={hasEpisode === true}
              onChange={(e) => { setHasEpisode(e.target.checked ? true : undefined); setPage(0); }}
            />
            <span className="text-sm font-medium text-text-primary">Solo noches con episodio</span>
          </label>
        </Card>
      </motion.div>

      {loading && <LoadingState label="Cargando historial nocturno" />}
      {error && (
        <StateBlock
          tone="danger"
          title="No se pudo cargar el historial"
          description={error}
          actionLabel="Reintentar"
          onAction={refetch}
        />
      )}

      {!loading && records.length === 0 && (
        <motion.div variants={staggerItem}>
          <StateBlock
            title="Sin registros"
            description="No hay noches registradas para el período seleccionado."
            icon={<BookOpen size={48} />}
            actionLabel="Registrar primera noche"
            onAction={() => navigate('/registrar-noche')}
          />
        </motion.div>
      )}

      <motion.div className="relative space-y-4 pl-5" variants={staggerContainer}>
        {records.map((record, index) => {
          const tone = toneByLevel[record.attentionLevel];
          return (
            <motion.div key={record.id} variants={staggerItem} className="relative">
              <div className={`absolute -left-5 top-0 h-full w-px bg-gradient-to-b ${tone.rail} to-white/5`} />
              <div className={`absolute -left-[1.55rem] top-6 h-3.5 w-3.5 rounded-full ring-4 ring-night-950 ${tone.dot}`} />
              <Card className="p-4" onClick={() => navigate(`/historial/${record.id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Moon size={14} className={tone.text} />
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">
                        Noche {records.length - index}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-text-primary">{formatDate(record.date)}</p>
                    <p className="mt-1 text-xs font-semibold text-medicalBlue">
                      {record.measurementTime ? formatTime(record.measurementTime) : 'Hora no registrada'}
                    </p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-text-primary">
                      {formatGlucoseValue(record.glucoseBeforeSleep)}
                    </p>
                    {record.notes && (
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-text-secondary">{record.notes}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <AttentionBadge level={record.attentionLevel} size="sm" />
                    {record.hasEpisodes && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-severeRed/25 bg-severeRed/10 px-2 py-1 text-xs font-semibold text-severeRed">
                        <Zap size={12} /> Episodio
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {pageMeta && !pageMeta.last && (
        <motion.div variants={staggerItem}>
          <Button variant="secondary" className="w-full" onClick={() => setPage((p) => p + 1)}>
            <ChevronDown size={16} className="mr-2" />
            Cargar más
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
