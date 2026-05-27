import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Moon, PlusCircle, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PageHeader } from '../components/ui/PageHeader';
import { LoadingState, StateBlock } from '../components/ui/StateBlock';
import { MedicalStatusBadge } from '../components/ui/MedicalStatusBadge';
import { GlucoseOrb } from '../components/visual/GlucoseOrb';
import { getNightRecord, deleteNightRecord } from '../api/nightRecords';
import {
  formatDate,
  formatGlucoseValue,
  formatSleepQuality,
  formatStressLevel,
  formatSeverity,
  formatTime,
} from '../lib/formatters';
import { glucoseToMedicalStatus, nightRecordToMedicalStatus } from '../lib/medicalVisualState';
import type { NightRecord } from '../types';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-right text-sm font-semibold text-text-primary">{value}</span>
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
    setLoading(true);
    getNightRecord(id)
      .then(setRecord)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    const toastId = toast.loading('Eliminando registro...');
    try {
      await deleteNightRecord(id);
      toast.success('Registro eliminado', {
        id: toastId,
        description: 'La bitácora fue actualizada.',
      });
      navigate('/historial');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al eliminar';
      toast.error('No se pudo eliminar', { id: toastId, description: message });
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState label="Cargando detalle nocturno" />;
  if (error) {
    return (
      <StateBlock
        tone="danger"
        title="No se pudo cargar el registro"
        description={error}
        actionLabel="Volver al historial"
        onAction={() => navigate('/historial')}
      />
    );
  }
  if (!record) {
    return (
      <StateBlock
        title="Registro no disponible"
        description="No encontramos datos para esta noche."
        actionLabel="Volver al historial"
        onAction={() => navigate('/historial')}
      />
    );
  }

  const status = nightRecordToMedicalStatus(record);

  return (
    <div className="space-y-5">
      <PageHeader
        back
        icon={<Moon size={22} />}
        eyebrow="Detalle nocturno"
        title={formatDate(record.date)}
        description="Lectura médica clara del contexto registrado esa noche."
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/registrar-noche?id=${record.id}`)}
              aria-label="Editar registro"
            >
              <Edit2 size={16} />
            </Button>
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)} aria-label="Eliminar registro">
              <Trash2 size={16} />
            </Button>
          </div>
        }
      />

      <Card className="relative overflow-hidden p-5">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-28 rounded-full bg-medicalBlue/10 blur-3xl" />
        <div className="relative">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-secondary">Glucosa principal</p>
              <h2 className="mt-1 text-lg font-bold text-text-primary">Antes de dormir</h2>
            </div>
            <MedicalStatusBadge status={status} />
          </div>
          <GlucoseOrb value={record.glucoseBeforeSleep} status={status} label="Antes de dormir" />
          {record.glucoseWakeup && (
            <p className="text-center text-sm text-text-secondary">
              Al despertar: <span className="font-semibold text-text-primary">{formatGlucoseValue(record.glucoseWakeup)}</span>
            </p>
          )}
          {record.attentionReasons.length > 0 && (
            <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Motivos de atención</p>
              {record.attentionReasons.map((reason) => (
                <p key={reason} className="text-sm leading-6 text-text-secondary">{reason}</p>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-2 text-lg font-bold text-text-primary">Contexto</h2>
        <DetailRow label="Hora de acostarse" value={formatTime(record.bedtime)} />
        {record.wakeTime && <DetailRow label="Hora de despertar" value={formatTime(record.wakeTime)} />}
        <DetailRow label="Calidad del sueño" value={formatSleepQuality(record.sleepQuality)} />
        <DetailRow label="Nivel de estrés" value={formatStressLevel(record.stressLevel)} />
        <DetailRow label="Actividad física" value={record.physicalActivityToday ? 'Sí' : 'No'} />
        <DetailRow label="Colación nocturna" value={record.hadBedtimeSnack ? 'Sí' : 'No'} />
        {record.snackDescription && <DetailRow label="Descripción" value={record.snackDescription} />}
        {record.notes && (
          <div className="pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Notas</p>
            <p className="mt-2 text-sm leading-6 text-text-primary">{record.notes}</p>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Seguimiento</p>
            <h2 className="mt-1 text-lg font-bold text-text-primary">Episodios hipoglucémicos</h2>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/registrar-episodio?nightRecordId=${record.id}&date=${record.date}`)}
          >
            <PlusCircle size={14} className="mr-1" />
            Agregar
          </Button>
        </div>

        {!record.episodes || record.episodes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
            <p className="font-bold text-text-primary">Sin episodios registrados</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Esta noche no tiene eventos hipoglucémicos asociados.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {record.episodes.map((ep) => (
              <div key={ep.id} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl border border-severeRed/20 bg-severeRed/10 text-severeRed">
                      <Zap size={15} />
                    </span>
                    <div>
                      <p className="font-bold text-text-primary">{formatTime(ep.episodeTime)}</p>
                      <p className="text-xs text-text-secondary">{formatSeverity(ep.severity)}</p>
                    </div>
                  </div>
                  <MedicalStatusBadge status={ep.glucoseAtEpisode ? glucoseToMedicalStatus(ep.glucoseAtEpisode) : ep.severity === 'SEVERE' ? 'severe' : 'attention'} />
                </div>
                {ep.glucoseAtEpisode && (
                  <p className="text-sm text-text-secondary">
                    Glucosa: <span className="font-semibold text-text-primary">{formatGlucoseValue(ep.glucoseAtEpisode)}</span>
                  </p>
                )}
                {ep.symptoms.length > 0 && <p className="mt-1 text-xs text-text-secondary">{ep.symptoms.join(', ')}</p>}
                {ep.intervention && <p className="mt-2 text-sm leading-6 text-text-primary">{ep.intervention}</p>}
                {ep.recoveryTimeMinutes && (
                  <p className="mt-1 text-xs text-text-secondary">Recuperación: {ep.recoveryTimeMinutes} min</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

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
