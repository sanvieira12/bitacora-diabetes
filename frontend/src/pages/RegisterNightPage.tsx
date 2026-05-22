import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { AttentionBadge } from '../components/AttentionBadge';
import { GlucoseInput } from '../components/forms/GlucoseInput';
import { createNightRecord, getNightRecord, updateNightRecord } from '../api/nightRecords';
import { today } from '../lib/dateUtils';
import type { NightRecord, SleepQuality, StressLevel } from '../types';

const schema = z.object({
  date: z.string().min(1, 'La fecha es obligatoria'),
  glucoseBeforeSleep: z
    .number({ invalid_type_error: 'Ingresá un valor' })
    .min(20, 'Mínimo 20 mg/dL')
    .max(600, 'Máximo 600 mg/dL'),
  glucoseWakeup: z.number().min(20).max(600).optional().or(z.literal('')),
  hadBedtimeSnack: z.boolean(),
  snackDescription: z.string().optional(),
  bedtime: z.string().min(1, 'La hora es obligatoria'),
  wakeTime: z.string().optional(),
  sleepQuality: z.enum(['GOOD', 'FAIR', 'POOR'] as const),
  physicalActivityToday: z.boolean(),
  stressLevel: z.enum(['LOW', 'MEDIUM', 'HIGH'] as const),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function RegisterNightPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const [savedRecord, setSavedRecord] = React.useState<NightRecord | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [loadingEdit, setLoadingEdit] = React.useState(!!editId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: today(),
      bedtime: '23:00',
      hadBedtimeSnack: false,
      physicalActivityToday: false,
      sleepQuality: 'GOOD',
      stressLevel: 'LOW',
    },
  });

  const hadBedtimeSnack = watch('hadBedtimeSnack');
  const glucoseVal = watch('glucoseBeforeSleep');

  // Load existing record for edit mode
  useEffect(() => {
    if (!editId) return;
    getNightRecord(editId)
      .then((r) => {
        setValue('date', r.date);
        setValue('glucoseBeforeSleep', r.glucoseBeforeSleep);
        if (r.glucoseWakeup) setValue('glucoseWakeup', r.glucoseWakeup);
        setValue('hadBedtimeSnack', r.hadBedtimeSnack);
        if (r.snackDescription) setValue('snackDescription', r.snackDescription);
        setValue('bedtime', r.bedtime.slice(0, 5));
        if (r.wakeTime) setValue('wakeTime', r.wakeTime.slice(0, 5));
        setValue('sleepQuality', r.sleepQuality as SleepQuality);
        setValue('physicalActivityToday', r.physicalActivityToday);
        setValue('stressLevel', r.stressLevel as StressLevel);
        if (r.notes) setValue('notes', r.notes);
      })
      .catch(console.error)
      .finally(() => setLoadingEdit(false));
  }, [editId, setValue]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const payload = {
        date: data.date,
        glucoseBeforeSleep: data.glucoseBeforeSleep,
        glucoseWakeup: data.glucoseWakeup ? Number(data.glucoseWakeup) : undefined,
        hadBedtimeSnack: data.hadBedtimeSnack,
        snackDescription: data.hadBedtimeSnack ? data.snackDescription : undefined,
        bedtime: data.bedtime,
        wakeTime: data.wakeTime || undefined,
        sleepQuality: data.sleepQuality,
        physicalActivityToday: data.physicalActivityToday,
        stressLevel: data.stressLevel,
        notes: data.notes || undefined,
      };
      const saved = editId
        ? await updateNightRecord(editId, payload)
        : await createNightRecord(payload);
      setSavedRecord(saved);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEdit) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  if (savedRecord) {
    return (
      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-green-400" size={32} />
            <div>
              <h2 className="text-lg font-bold text-text-primary">¡Registro guardado!</h2>
              <p className="text-sm text-text-secondary">{savedRecord.date}</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-text-secondary text-sm mb-2">Nivel de atención:</p>
            <AttentionBadge
              level={savedRecord.attentionLevel}
              reasons={savedRecord.attentionReasons}
              size="lg"
            />
          </div>
          {savedRecord.attentionReasons.length > 0 && (
            <ul className="space-y-1 mb-4">
              {savedRecord.attentionReasons.map((r, i) => (
                <li key={i} className="text-sm text-text-secondary">
                  • {r}
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/')} className="flex-1">
              Volver al inicio
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/historial/${savedRecord.id}`)}
              className="flex-1"
            >
              Ver detalle
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors text-text-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-text-primary">
          {editId ? 'Editar registro' : 'Nueva noche'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Date */}
        <Input
          label="Fecha"
          type="date"
          {...register('date')}
          error={errors.date?.message}
        />

        {/* Glucosa section */}
        <Card className="p-4 space-y-4">
          <h2 className="font-semibold text-text-primary">Glucosa</h2>
          <GlucoseInput
            label="Antes de dormir *"
            required
            value={String(glucoseVal ?? '')}
            onChange={(v) => setValue('glucoseBeforeSleep', Number(v), { shouldValidate: true })}
            error={errors.glucoseBeforeSleep?.message}
          />
          <GlucoseInput
            label="Al despertar (opcional)"
            value={String(watch('glucoseWakeup') ?? '')}
            onChange={(v) => setValue('glucoseWakeup', v ? Number(v) : undefined)}
            error={errors.glucoseWakeup?.message}
          />
        </Card>

        {/* Sueño section */}
        <Card className="p-4 space-y-4">
          <h2 className="font-semibold text-text-primary">Sueño</h2>
          <Input label="Hora de acostarse *" type="time" {...register('bedtime')} error={errors.bedtime?.message} />
          <Input label="Hora de despertar (opcional)" type="time" {...register('wakeTime')} />
          <Select
            label="Calidad del sueño *"
            {...register('sleepQuality')}
            error={errors.sleepQuality?.message}
            options={[
              { value: 'GOOD', label: 'Buena' },
              { value: 'FAIR', label: 'Regular' },
              { value: 'POOR', label: 'Mala' },
            ]}
          />
        </Card>

        {/* Colación section */}
        <Card className="p-4 space-y-4">
          <h2 className="font-semibold text-text-primary">Colación nocturna</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-border bg-background accent-blue-500"
              {...register('hadBedtimeSnack')}
            />
            <span className="text-text-primary">¿Tomó colación antes de dormir?</span>
          </label>
          {hadBedtimeSnack && (
            <Input
              label="Descripción (opcional)"
              placeholder="Ej: 1 galletita, 15g hidratos..."
              {...register('snackDescription')}
            />
          )}
        </Card>

        {/* Otros factores */}
        <Card className="p-4 space-y-4">
          <h2 className="font-semibold text-text-primary">Otros factores</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-border bg-background accent-blue-500"
              {...register('physicalActivityToday')}
            />
            <span className="text-text-primary">Hizo actividad física hoy</span>
          </label>
          <Select
            label="Nivel de estrés *"
            {...register('stressLevel')}
            error={errors.stressLevel?.message}
            options={[
              { value: 'LOW', label: 'Bajo' },
              { value: 'MEDIUM', label: 'Moderado' },
              { value: 'HIGH', label: 'Alto' },
            ]}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Notas (opcional)</label>
            <textarea
              className="bg-background border border-border rounded-xl px-4 py-3 text-text-primary
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                placeholder:text-text-secondary/50 transition-colors min-h-[80px] resize-none"
              placeholder="Cualquier observación adicional..."
              {...register('notes')}
            />
          </div>
        </Card>

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting}>
          {editId ? 'Guardar cambios' : 'Registrar noche'}
        </Button>
      </form>
    </div>
  );
}
