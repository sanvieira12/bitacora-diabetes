import { useState } from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { getDoctorSummary, downloadPdf, downloadCsv } from '../api/reports';
import { formatDate, formatGlucose, formatSeverity, formatTime } from '../lib/formatters';
import { today, nDaysAgo } from '../lib/dateUtils';
import type { DoctorSummary } from '../types';

export function ReportPage() {
  const [from, setFrom] = useState(nDaysAgo(30));
  const [to, setTo] = useState(today());
  const [summary, setSummary] = useState<DoctorSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDoctorSummary(from, to);
      setSummary(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al generar la vista previa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <FileText className="text-blue-400" size={24} />
        <h1 className="text-xl font-bold text-text-primary">Informe para la médica</h1>
      </div>

      {/* Date range */}
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold text-text-primary">Período</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Desde" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="Hasta" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button variant="secondary" size="md" className="w-full" onClick={handlePreview} loading={loading}>
          <Eye size={16} className="mr-2" />
          Generar vista previa
        </Button>
      </Card>

      {/* Download buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="primary"
          size="md"
          className="flex-col h-20 gap-1"
          onClick={() => downloadPdf(from, to)}
        >
          <Download size={20} />
          <span className="text-sm">Descargar PDF</span>
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="flex-col h-20 gap-1"
          onClick={() => downloadCsv(from, to)}
        >
          <Download size={20} />
          <span className="text-sm">Descargar CSV</span>
        </Button>
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      {loading && <LoadingSpinner className="py-8" />}

      {/* Preview */}
      {summary && !loading && (
        <div className="space-y-5">
          {/* Stats overview */}
          <Card className="p-4">
            <h2 className="font-semibold text-text-primary mb-3">
              Estadísticas del período ({formatDate(summary.from)} — {formatDate(summary.to)})
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Noches', value: summary.statistics.totalNights },
                { label: 'Episodios', value: summary.statistics.totalEpisodes },
                { label: 'Tasa', value: `${summary.statistics.episodeRate}%` },
                { label: 'Prom. glucosa', value: `${summary.statistics.avgGlucoseBeforeSleep} mg/dL` },
                { label: 'Glucosa min', value: `${summary.statistics.minGlucoseBeforeSleep} mg/dL` },
                { label: 'Glucosa max', value: `${summary.statistics.maxGlucoseBeforeSleep} mg/dL` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center py-2 bg-background rounded-xl">
                  <p className="text-lg font-bold text-text-primary">{value}</p>
                  <p className="text-xs text-text-secondary">{label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Episodes list */}
          {summary.episodes.length > 0 && (
            <Card className="p-4">
              <h2 className="font-semibold text-text-primary mb-3">
                Episodios ({summary.episodes.length})
              </h2>
              <div className="space-y-3">
                {summary.episodes.map((ep) => (
                  <div key={ep.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text-primary">
                        {formatDate(ep.episodeDate)} — {formatTime(ep.episodeTime)}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          ep.severity === 'MILD'
                            ? 'bg-green-400/20 text-green-400'
                            : ep.severity === 'MODERATE'
                            ? 'bg-yellow-400/20 text-yellow-400'
                            : 'bg-red-400/20 text-red-400'
                        }`}
                      >
                        {formatSeverity(ep.severity)}
                      </span>
                    </div>
                    {ep.glucoseAtEpisode && (
                      <p className="text-xs text-text-secondary">
                        Glucosa: {formatGlucose(ep.glucoseAtEpisode)}
                      </p>
                    )}
                    <p className="text-sm text-text-secondary">{ep.intervention}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-text-secondary/60 text-center italic">{summary.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
