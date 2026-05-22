import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, PlusCircle, Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AttentionBadge } from '../components/AttentionBadge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { getNightRecord, deleteNightRecord } from '../api/nightRecords';
import {
  formatDate,
  formatGlucose,
  formatSleepQuality,
  formatStressLevel,
  formatSeverity,
  formatTime,
} from '../lib/formatters';
import type { NightRecord } from '../types';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}

export function NightDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<NightRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getNightRecord(id)
      .then(setRecord)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteNightRecord(id);
      navigate('/historial');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al eliminar');
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner className="py-12" />;
  if (error) return <p className="text-red-400 text-center py-12">{error}</p>;
  if (!record) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-text-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-text-primary">{formatDate(record.date)}</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/registrar-noche?id=${record.id}`)}
        >
          <Edit2 size={16} />
        </Button>
        <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
          <Trash2 size={16} />
        </Button>
      </div>

      {/* Glucose & attention */}
      <Card className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-text-secondary mb-1">Glucosa antes de dormir</p>
            <p className="text-4xl font-bold text-text-primary">
              {formatGlucose(record.glucoseBeforeSleep)}
            </p>
          </div>
          <AttentionBadge level={record.attentionLevel} reasons={record.attentionReasons} size="lg" />
        </div>
        {record.glucoseWakeup && (
          <p className="text-sm text-text-secondary mt-2">
            Al despertar: <span className="text-text-primary font-medium">{formatGlucose(record.glucoseWakeup)}</span>
          </p>
        )}
        {record.attentionReasons.length > 0 && (
          <div className="mt-3 space-y-1">
            {record.attentionReasons.map((r, i) => (
              <p key={i} className="text-xs text-text-secondary">• {r}</p>
            ))}
          </div>
        )}
      </Card>

      {/* Details */}
      <Card className="p-4">
        <h2 className="font-semibold text-text-primary mb-3">Detalles</h2>
        <DetailRow label="Hora de acostarse" value={formatTime(record.bedtime)} />
        {record.wakeTime && <DetailRow label="Hora de despertar" value={formatTime(record.wakeTime)} />}
        <DetailRow label="Calidad del sueño" value={formatSleepQuality(record.sleepQuality)} />
        <DetailRow label="Nivel de estrés" value={formatStressLevel(record.stressLevel)} />
        <DetailRow label="Actividad física" value={record.physicalActivityToday ? 'Sí' : 'No'} />
        <DetailRow label="Colación nocturna" value={record.hadBedtimeSnack ? 'Sí' : 'No'} />
        {record.snackDescription && (
          <DetailRow label="Descripción colación" value={record.snackDescription} />
        )}
        {record.notes && (
          <div className="pt-3">
            <p className="text-xs text-text-secondary mb-1">Notas</p>
            <p className="text-sm text-text-primary">{record.notes}</p>
          </div>
        )}
      </Card>

      {/* Episodes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-text-primary">Episodios hipoglucémicos</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              navigate(`/registrar-episodio?nightRecordId=${record.id}&date=${record.date}`)
            }
          >
            <PlusCircle size={14} className="mr-1" />
            Agregar
          </Button>
        </div>

        {!record.episodes || record.episodes.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-4">
            Sin episodios registrados para esta noche.
          </p>
        ) : (
          <div className="space-y-3">
            {record.episodes.map((ep) => (
              <Card key={ep.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="text-red-400" size={16} />
                    <span className="font-medium text-text-primary">
                      {formatTime(ep.episodeTime)}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
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
                  <p className="text-sm text-text-secondary">
                    Glucosa: <span className="text-text-primary">{formatGlucose(ep.glucoseAtEpisode)}</span>
                  </p>
                )}
                {ep.symptoms.length > 0 && (
                  <p className="text-xs text-text-secondary mt-1">{ep.symptoms.join(', ')}</p>
                )}
                <p className="text-sm text-text-primary mt-2">{ep.intervention}</p>
                {ep.recoveryTimeMinutes && (
                  <p className="text-xs text-text-secondary mt-1">
                    Recuperación: {ep.recoveryTimeMinutes} min
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        title="Eliminar registro"
        message="¿Estás segura de que querés eliminar este registro nocturno? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        confirmLabel={deleting ? 'Eliminando...' : 'Eliminar'}
      />
    </div>
  );
}
