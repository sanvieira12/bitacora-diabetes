import { useState } from 'react';
import { Download, Eye, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { LoadingState, StateBlock } from '../components/ui/StateBlock';
import { MedicalStatusBadge } from '../components/ui/MedicalStatusBadge';
import { getDoctorSummary, downloadPdf, downloadCsv } from '../api/reports';
import { formatDate, formatGlucoseValue, formatSeverity, formatTime } from '../lib/formatters';
import { today, nDaysAgo } from '../lib/dateUtils';
import { glucoseToMedicalStatus } from '../lib/medicalVisualState';
import type { DoctorSummary } from '../types';

function SummaryTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-4 text-center">
      <p className="text-2xl font-extrabold tracking-tight text-text-primary">{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">{label}</p>
    </div>
  );
}

export function ReportPage() {
  const [from, setFrom] = useState(nDaysAgo(30));
  const [to, setTo] = useState(today());
  const [summary, setSummary] = useState<DoctorSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    const toastId = toast.loading('Generando informe...');
    try {
      const data = await getDoctorSummary(from, to);
      setSummary(data);
      toast.success('Vista previa lista', {
        id: toastId,
        description: 'El resumen médico quedó preparado.',
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al generar la vista previa';
      setError(message);
      toast.error('No se pudo generar el informe', {
        id: toastId,
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (type: 'pdf' | 'csv') => {
    toast.success(type === 'pdf' ? 'Descargando PDF' : 'Descargando CSV', {
      description: 'Se está preparando el archivo del período seleccionado.',
    });
    if (type === 'pdf') downloadPdf(from, to);
    else downloadCsv(from, to);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<FileText size={22} />}
        eyebrow="Resumen clínico"
        title="Informe para la médica"
        description="Prepará un período claro, descargable y fácil de revisar en consulta."
      />

      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/10 text-medicalBlue">
            <Send size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Período del informe</h2>
            <p className="text-sm text-text-secondary">Elegí las fechas y generá una vista previa.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Desde" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="Hasta" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button variant="secondary" size="md" className="w-full" onClick={handlePreview} loading={loading}>
          <Eye size={16} className="mr-2" />
          Generar vista previa
        </Button>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="primary"
          size="md"
          className="h-20 flex-col gap-1"
          onClick={() => handleDownload('pdf')}
        >
          <Download size={20} />
          <span className="text-sm">PDF</span>
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="h-20 flex-col gap-1"
          onClick={() => handleDownload('csv')}
        >
          <Download size={20} />
          <span className="text-sm">CSV</span>
        </Button>
      </div>

      {error && (
        <StateBlock
          tone="danger"
          title="No se pudo generar"
          description={error}
          actionLabel="Reintentar"
          onAction={handlePreview}
        />
      )}

      {loading && <LoadingState label="Preparando informe médico" />}

      {summary && !loading && (
        <div className="space-y-5">
          <Card className="space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                {formatDate(summary.from)} a {formatDate(summary.to)}
              </p>
              <h2 className="mt-1 text-xl font-bold text-text-primary">Resumen del período</h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-medicalBlue">
                Glucosa en mg/dL
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SummaryTile label="Noches" value={summary.statistics.totalNights} />
              <SummaryTile label="Episodios" value={summary.statistics.totalEpisodes} />
              <SummaryTile label="Tasa" value={`${summary.statistics.episodeRate}%`} />
              <SummaryTile label="Promedio" value={summary.statistics.avgGlucoseBeforeSleep} />
              <SummaryTile label="Mínima" value={summary.statistics.minGlucoseBeforeSleep} />
              <SummaryTile label="Máxima" value={summary.statistics.maxGlucoseBeforeSleep} />
            </div>
          </Card>

          {summary.episodes.length > 0 && (
            <Card className="space-y-3 p-5">
              <h2 className="text-lg font-bold text-text-primary">Episodios registrados</h2>
              <div className="space-y-3">
                {summary.episodes.map((ep) => (
                  <div key={ep.id} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-text-primary">
                          {formatDate(ep.episodeDate)} · {formatTime(ep.episodeTime)}
                        </p>
                        {ep.glucoseAtEpisode && (
                          <p className="mt-1 text-xs text-text-secondary">
                            Glucosa: {formatGlucoseValue(ep.glucoseAtEpisode)}
                          </p>
                        )}
                      </div>
                      <MedicalStatusBadge status={ep.glucoseAtEpisode ? glucoseToMedicalStatus(ep.glucoseAtEpisode) : ep.severity === 'SEVERE' ? 'severe' : 'attention'} />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                      {formatSeverity(ep.severity)}
                    </p>
                    {ep.intervention && <p className="mt-2 text-sm leading-6 text-text-secondary">{ep.intervention}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-xs italic leading-5 text-text-secondary/70">
            {summary.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
