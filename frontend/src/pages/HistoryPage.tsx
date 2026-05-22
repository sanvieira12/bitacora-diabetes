import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, BookOpen, ChevronDown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AttentionBadge } from '../components/AttentionBadge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useNightRecords } from '../hooks/useNightRecords';
import { formatDate, formatGlucose } from '../lib/formatters';
import { today, nDaysAgo } from '../lib/dateUtils';

export function HistoryPage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState(nDaysAgo(30));
  const [to, setTo] = useState(today());
  const [hasEpisode, setHasEpisode] = useState<boolean | undefined>(undefined);
  const [attentionLevel, setAttentionLevel] = useState('');
  const [page, setPage] = useState(0);

  const { records, loading, error, page: pageMeta } = useNightRecords({
    from,
    to,
    hasEpisode,
    attentionLevel: attentionLevel || undefined,
    page,
    size: 20,
  });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-text-primary">Historial</h1>

      {/* Filters */}
      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-semibold text-text-secondary">Filtros</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Desde" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} />
          <Input label="Hasta" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} />
        </div>
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
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-5 h-5 rounded border-border bg-background accent-blue-500"
            checked={hasEpisode === true}
            onChange={(e) => { setHasEpisode(e.target.checked ? true : undefined); setPage(0); }}
          />
          <span className="text-sm text-text-primary">Solo noches con episodio</span>
        </label>
      </Card>

      {/* Records list */}
      {loading && <LoadingSpinner className="py-8" />}
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      {!loading && records.length === 0 && (
        <EmptyState
          title="Sin registros"
          description="No hay noches registradas para el período seleccionado."
          icon={<BookOpen size={48} />}
          action={
            <Button variant="primary" onClick={() => navigate('/registrar-noche')}>
              Registrar primera noche
            </Button>
          }
        />
      )}

      <div className="space-y-3">
        {records.map((record) => (
          <Card
            key={record.id}
            className="p-4"
            onClick={() => navigate(`/historial/${record.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary mb-1">{formatDate(record.date)}</p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatGlucose(record.glucoseBeforeSleep)}
                </p>
                {record.notes && (
                  <p className="text-xs text-text-secondary mt-1 truncate">{record.notes}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 ml-3">
                <AttentionBadge level={record.attentionLevel} size="sm" />
                {record.hasEpisodes && (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <Zap size={12} /> Episodio
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pageMeta && !pageMeta.last && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setPage((p) => p + 1)}
        >
          <ChevronDown size={16} className="mr-2" />
          Cargar más
        </Button>
      )}
      {pageMeta && (
        <p className="text-xs text-text-secondary text-center">
          {pageMeta.totalElements} registros en total
        </p>
      )}
    </div>
  );
}
