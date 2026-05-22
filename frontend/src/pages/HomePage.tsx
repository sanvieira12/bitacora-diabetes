import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Zap, BookOpen, BarChart2, FileText, Moon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AttentionBadge } from '../components/AttentionBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { getNightRecords } from '../api/nightRecords';
import { getStatisticsSummary } from '../api/statistics';
import { formatDate, formatGlucose } from '../lib/formatters';
import { nDaysAgo, today } from '../lib/dateUtils';
import type { NightRecordSummary, StatisticsSummary } from '../types';

export function HomePage() {
  const navigate = useNavigate();
  const [lastRecord, setLastRecord] = useState<NightRecordSummary | null>(null);
  const [weekStats, setWeekStats] = useState<StatisticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = nDaysAgo(7);
    const to = today();
    Promise.all([
      getNightRecords({ page: 0, size: 1 }),
      getStatisticsSummary(from, to),
    ])
      .then(([records, stats]) => {
        setLastRecord(records.data[0] ?? null);
        setWeekStats(stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-center gap-2">
        <Moon className="text-blue-400" size={24} />
        <div>
          <h1 className="text-xl font-bold text-text-primary">Buenas noches, Juana</h1>
          <p className="text-sm text-text-secondary">Tu registro glucémico nocturno</p>
        </div>
      </div>

      {/* Last record card */}
      {loading ? (
        <LoadingSpinner className="py-8" />
      ) : lastRecord ? (
        <Card
          className="p-5 cursor-pointer"
          onClick={() => navigate(`/historial/${lastRecord.id}`)}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-text-secondary mb-1">Último registro</p>
              <p className="text-sm font-medium text-text-primary">{formatDate(lastRecord.date)}</p>
            </div>
            <AttentionBadge level={lastRecord.attentionLevel} reasons={lastRecord.attentionReasons} />
          </div>
          <p className="text-4xl font-bold text-text-primary">
            {formatGlucose(lastRecord.glucoseBeforeSleep)}
          </p>
          <p className="text-xs text-text-secondary mt-1">antes de dormir</p>
          {lastRecord.hasEpisodes && (
            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <Zap size={12} /> Tuvo episodio hipoglucémico
            </p>
          )}
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <Moon className="mx-auto text-text-secondary mb-3" size={40} />
          <p className="text-text-secondary">Aún no hay registros nocturnos.</p>
          <p className="text-text-secondary text-sm">¡Registrá tu primera noche!</p>
        </Card>
      )}

      {/* Week summary */}
      {weekStats && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-text-primary">{weekStats.totalNights}</p>
            <p className="text-xs text-text-secondary mt-1">Noches esta semana</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{weekStats.totalEpisodes}</p>
            <p className="text-xs text-text-secondary mt-1">Episodios</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{weekStats.nightsGreen}</p>
            <p className="text-xs text-text-secondary mt-1">Noches óptimas</p>
          </Card>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => navigate('/registrar-noche')}
        >
          <PlusCircle size={20} className="mr-2" />
          Registrar noche
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => navigate('/registrar-episodio')}
        >
          <Zap size={20} className="mr-2" />
          Registrar episodio
        </Button>
        <div className="grid grid-cols-3 gap-3">
          <Button variant="ghost" size="md" className="flex-col h-20 gap-1" onClick={() => navigate('/historial')}>
            <BookOpen size={20} />
            <span className="text-xs">Historial</span>
          </Button>
          <Button variant="ghost" size="md" className="flex-col h-20 gap-1" onClick={() => navigate('/estadisticas')}>
            <BarChart2 size={20} />
            <span className="text-xs">Estadísticas</span>
          </Button>
          <Button variant="ghost" size="md" className="flex-col h-20 gap-1" onClick={() => navigate('/informe')}>
            <FileText size={20} />
            <span className="text-xs">Informe</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
