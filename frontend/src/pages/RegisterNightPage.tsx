import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react';
import { toast } from 'sonner';
import { GlucoseSlider } from '../components/forms/GlucoseSlider';
import { PillSelect } from '../components/forms/PillSelect';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GlucoseOrb } from '../components/visual/GlucoseOrb';
import { createNightRecord, getNightRecord, updateNightRecord } from '../api/nightRecords';
import { glucoseToMedicalStatus } from '../lib/medicalVisualState';
import { formatDate, formatTime } from '../lib/formatters';
import { nowTime, today } from '../lib/dateUtils';
import type { NightRecord, NightRecordRequest, StressLevel } from '../types';

const ALCOHOL_OPTIONS = [
  { value: 'none',     label: 'Sin alcohol' },
  { value: 'little',  label: 'Cantidad baja' },
  { value: 'moderate',label: 'Cantidad moderada' },
  { value: 'a_lot',   label: 'Cantidad alta' },
];

const DINNER_OPTIONS = [
  { value: 'nothing',    label: 'No cené' },
  { value: 'light',      label: 'Cena liviana' },
  { value: 'normal',     label: 'Cena normal' },
  { value: 'heavy',      label: 'Cena pesada' },
  { value: 'very_heavy', label: 'Cena muy pesada' },
];

const EXERCISE_OPTIONS = [
  { value: 'none',     label: 'Sin ejercicio' },
  { value: 'light',   label: 'Actividad liviana' },
  { value: 'moderate',label: 'Actividad moderada' },
  { value: 'intense', label: 'Actividad intensa' },
];

const STRESS_OPTIONS = [
  { value: 'LOW',    label: 'Bajo' },
  { value: 'MEDIUM', label: 'Moderado' },
  { value: 'HIGH',   label: 'Alto' },
];

interface FormState {
  glucoseBeforeSleep: number;
  bedtime: string;
  alcohol: string | null;
  dinnerType: string | null;
  exerciseLevel: string | null;
  stressLevel: StressLevel | null;
  notes: string;
}

const STEPS = ['Glucosa', 'Contexto', 'Detalles'];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 rounded-full transition-all duration-300"
          style={{
            width: i === current ? 24 : 8,
            background: i <= current ? 'var(--gaga-accent)' : 'var(--gaga-surface-2)',
          }}
        />
      ))}
    </div>
  );
}

export function RegisterNightPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [shake, setShake] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState<NightRecord | null>(null);
  const [recordDate, setRecordDate] = useState(today());
  const [isEditingDateTime, setIsEditingDateTime] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const [form, setForm] = useState<FormState>({
    glucoseBeforeSleep: 120,
    bedtime: nowTime(),
    alcohol: 'none',
    dinnerType: 'normal',
    exerciseLevel: 'none',
    stressLevel: 'MEDIUM',
    notes: '',
  });

  useEffect(() => {
    if (!editId) {
      setEditingRecord(null);
      setRecordDate(today());
      return;
    }

    setLoadingRecord(true);
    getNightRecord(editId)
      .then((record) => {
        setEditingRecord(record);
        setRecordDate(record.date);
        setForm({
          glucoseBeforeSleep: record.glucoseBeforeSleep,
          bedtime: formatTime(record.bedtime),
          alcohol: record.alcohol ?? 'none',
          dinnerType: record.dinnerType ?? 'normal',
          exerciseLevel: record.exerciseLevel ?? (record.physicalActivityToday ? 'moderate' : 'none'),
          stressLevel: record.stressLevel,
          notes: record.notes ?? '',
        });
      })
      .catch((error: Error) => {
        toast.error('No se pudo cargar el registro', {
          description: error.message,
        });
        navigate('/historial', { replace: true });
      })
      .finally(() => setLoadingRecord(false));
  }, [editId, navigate]);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const canAdvance = (): boolean => {
    return true;
  };

  const goStep = (next: number) => {
    if (animating) return;
    setDirection(next > step ? 'forward' : 'back');
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 250);
  };

  const handleSubmit = async () => {
    if (!canAdvance() || submitting) return;
    setSubmitting(true);
    const isEditing = Boolean(editId);
    const toastId = toast.loading(isEditing ? 'Guardando cambios...' : 'Guardando registro nocturno...');
    if (btnRef.current) btnRef.current.style.transform = 'scale(0.97)';
    try {
      const request: NightRecordRequest = {
        date: recordDate,
        measurementTime: form.bedtime,
        glucoseBeforeSleep: form.glucoseBeforeSleep,
        glucoseWakeup: editingRecord?.glucoseWakeup,
        bedtime: form.bedtime,
        wakeTime: editingRecord?.wakeTime,
        hadBedtimeSnack: editingRecord?.hadBedtimeSnack ?? false,
        snackDescription: editingRecord?.snackDescription,
        sleepQuality: editingRecord?.sleepQuality ?? 'GOOD',
        physicalActivityToday: form.exerciseLevel !== 'none' && form.exerciseLevel !== null,
        stressLevel: form.stressLevel ?? 'LOW',
        notes: form.notes || undefined,
        alcohol: form.alcohol ?? undefined,
        dinnerType: form.dinnerType ?? undefined,
        exerciseLevel: form.exerciseLevel ?? undefined,
      };
      const saved = editId
        ? await updateNightRecord(editId, request)
        : await createNightRecord(request);
      toast.success(isEditing ? 'Registro actualizado' : 'Registro nocturno guardado', {
        id: toastId,
        description: 'Quedó sincronizado en tu bitácora.',
      });
      setSubmitState('success');
      setTimeout(() => navigate(isEditing ? `/historial/${saved.id}` : '/'), 900);
    } catch {
      toast.error(isEditing ? 'No se pudieron guardar los cambios' : 'No se pudo guardar la noche', {
        id: toastId,
        description: 'Revisá la conexión o intentá de nuevo en unos segundos.',
      });
      setSubmitState('error');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setSubmitState('idle');
        if (btnRef.current) btnRef.current.style.transform = '';
      }, 600);
    } finally {
      setSubmitting(false);
    }
  };

  const slideClass = animating
    ? direction === 'forward'
      ? 'opacity-0 -translate-x-4'
      : 'opacity-0 translate-x-4'
    : 'opacity-100 translate-x-0';

  const visualStatus = glucoseToMedicalStatus(form.glucoseBeforeSleep);
  const automaticDate = recordDate;

  if (loadingRecord) {
    return (
      <div className="grid min-h-[calc(100vh-120px)] place-items-center text-sm text-text-secondary">
        Cargando registro...
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => (step > 0 ? goStep(step - 1) : navigate(-1))}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-text-secondary transition hover:bg-white/15 hover:text-text-primary active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-text-secondary font-medium">{STEPS[step]}</span>
          <StepIndicator current={step} total={STEPS.length} />
        </div>
        <button
          type="button"
          onClick={() => navigate('/registro-rapido')}
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/10 text-text-secondary transition hover:text-medicalBlue"
          aria-label="Ir a registro rápido"
          title="Registro rápido"
        >
          <Clock3 size={17} />
        </button>
      </div>

      {/* Step content */}
      <Card
        className={`relative flex-1 overflow-hidden p-5 transition-all duration-300 ease-out ${slideClass}`}
        style={{ transitionProperty: 'opacity, transform' }}
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-28 rounded-full bg-medicalBlue/10 blur-3xl" />
        <div className="relative">
        {step === 0 && (
          <div className="space-y-4">
            <GlucoseOrb value={form.glucoseBeforeSleep} status={visualStatus} label="Antes de dormir" size="sm" />
            <h2 className="text-xl font-bold text-text-primary text-center">
              ¿Cuánto tenés de glucosa?
            </h2>
            <p className="text-center text-text-secondary text-sm">Antes de dormir</p>
            <GlucoseSlider
              value={form.glucoseBeforeSleep}
              onChange={(v) => set('glucoseBeforeSleep', v)}
              showValueDisplay={false}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-text-primary text-center">
              Contexto rápido
            </h2>
            <div className="rounded-3xl border border-medicalBlue/20 bg-medicalBlue/10 px-4 py-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                Fecha y hora automáticas
              </p>
              <p className="mt-1 text-sm font-bold text-text-primary">
                {formatDate(automaticDate)} · {formatTime(form.bedtime)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsEditingDateTime((prev) => {
                  const next = !prev;
                  if (!next) {
                    setRecordDate(editingRecord?.date ?? today());
                    set('bedtime', editingRecord ? formatTime(editingRecord.bedtime) : nowTime());
                  }
                  return next;
                });
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-white/15"
            >
              {isEditingDateTime ? 'Usar fecha y hora automática' : 'Editar fecha y hora'}
            </button>
            {isEditingDateTime && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  Fecha
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-2 py-2 text-sm font-semibold normal-case tracking-normal text-text-primary outline-none focus:border-medicalBlue/60"
                  />
                </label>
                <label className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  Hora
                  <input
                    type="time"
                    value={form.bedtime}
                    onChange={(e) => set('bedtime', e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-2 py-2 text-sm font-semibold normal-case tracking-normal text-text-primary outline-none focus:border-medicalBlue/60"
                  />
                </label>
              </div>
            )}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-text-secondary">Alcohol</p>
              <PillSelect
                options={ALCOHOL_OPTIONS}
                value={form.alcohol}
                onChange={(v) => set('alcohol', v)}
              />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-text-secondary">Cena</p>
              <PillSelect
                options={DINNER_OPTIONS}
                value={form.dinnerType}
                onChange={(v) => set('dinnerType', v)}
              />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-text-secondary">Actividad física</p>
              <PillSelect
                options={EXERCISE_OPTIONS}
                value={form.exerciseLevel}
                onChange={(v) => set('exerciseLevel', v)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary text-center">
              Últimos detalles
            </h2>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-text-secondary">Nivel de estrés</label>
              <PillSelect
                options={STRESS_OPTIONS}
                value={form.stressLevel}
                onChange={(v) => set('stressLevel', v as StressLevel)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Notas (opcional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Cualquier observación..."
                className="glass-input w-full rounded-2xl border border-white/10 px-4 py-3
                  text-text-primary placeholder:text-text-secondary/40 focus:outline-none
                  focus:border-accent transition-colors resize-none min-h-[80px]"
              />
            </div>
          </div>
        )}
        </div>
      </Card>

      {/* Bottom button */}
      <div className="mt-6 pt-4">
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => goStep(step + 1)}
            disabled={!canAdvance()}
            className="w-full"
            size="lg"
          >
            Siguiente
            <ArrowRight size={18} />
          </Button>
        ) : (
          <Button
            ref={btnRef}
            onClick={handleSubmit}
            disabled={!canAdvance() || submitting}
            className={`w-full ${shake ? 'animate-shake' : ''}`}
            size="lg"
          >
            {submitState === 'success' ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path
                    d="M5 13l4 4L19 7"
                    style={{
                      strokeDasharray: 100,
                      strokeDashoffset: 0,
                      animation: 'drawCheck 400ms ease-out forwards',
                    }}
                  />
                </svg>
                ¡Guardado!
              </>
            ) : submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Guardando…
              </>
            ) : (
              <>{editId ? 'Guardar cambios' : 'Registrar noche'}</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
