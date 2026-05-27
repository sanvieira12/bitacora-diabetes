import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { GlucoseSlider } from '../components/forms/GlucoseSlider';
import { SnappedSlider } from '../components/forms/SnappedSlider';
import { SymptomChips } from '../components/forms/SymptomChips';
import { PillSelect } from '../components/forms/PillSelect';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GlucoseOrb } from '../components/visual/GlucoseOrb';
import { createEpisode } from '../api/episodes';
import { nowTime, today } from '../lib/dateUtils';
import { formatDate, formatTime } from '../lib/formatters';
import { glucoseToMedicalStatus } from '../lib/medicalVisualState';
import type { EpisodeSeverity } from '../types';

// ── Slider option sets ────────────────────────────────────────────────────────

const SEVERITY_OPTIONS = [
  { value: 'MILD',     label: 'Leve',     color: 'var(--gaga-accent)' },
  { value: 'MODERATE', label: 'Moderado', color: '#fb923c' },
  { value: 'SEVERE',   label: 'Severo',   color: 'var(--gaga-danger)' },
];

const RECOVERY_OPTIONS = [
  { value: 'FAST',      label: '< 15 min',    color: 'var(--gaga-success)' },
  { value: 'NORMAL',    label: '15-30 min',   color: 'var(--gaga-accent)' },
  { value: 'SLOW',      label: '30-60 min',   color: '#fb923c' },
  { value: 'VERY_SLOW', label: '+ de 1 hora', color: 'var(--gaga-danger)' },
];

const INTERVENTION_OPTIONS = [
  { value: 'honey',        label: 'Miel' },
  { value: 'candy',        label: 'Algo dulce' },
  { value: 'sugar_water',  label: 'Agua con azúcar' },
];

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = ['Glucosa', 'Severidad', 'Síntomas', 'Intervención', 'Después'];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 rounded-full transition-all duration-300"
          style={{
            width: i === current ? 24 : 8,
            background: i <= current ? 'var(--gaga-danger)' : 'var(--gaga-surface-2)',
          }}
        />
      ))}
    </div>
  );
}

function severityFromGlucose(value: number): EpisodeSeverity {
  if (value < 54) return 'SEVERE';
  if (value < 70) return 'MODERATE';
  return 'MILD';
}

// ── Form state ────────────────────────────────────────────────────────────────

interface FormState {
  time: string;
  glucoseAtEpisode: number;
  glucoseEnabled: boolean;
  severity: EpisodeSeverity | null;
  symptoms: string[];
  symptomsNote: string;
  interventionType: string | null;
  interventionNote: string;
  postGlucoseEnabled: boolean;
  postGlucose: number;
  recoveryTime: string | null;
  notes: string;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function RegisterEpisodePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nightRecordId = searchParams.get('nightRecordId') || undefined;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [shake, setShake] = useState(false);
  const [episodeDate, setEpisodeDate] = useState(today());
  const [isEditingDateTime, setIsEditingDateTime] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const [form, setForm] = useState<FormState>({
    time: nowTime(),
    glucoseAtEpisode: 55,
    glucoseEnabled: true,
    severity: 'MODERATE',
    symptoms: ['hipoglucemia'],
    symptomsNote: '',
    interventionType: null,
    interventionNote: '',
    postGlucoseEnabled: false,
    postGlucose: 90,
    recoveryTime: null,
    notes: '',
  });

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const canAdvance = (): boolean => {
    if (step === 1 && form.severity === null) return false;
    if (step === 2 && form.symptoms.length === 0) return false;
    if (step === 3 && form.interventionType === null) return false;
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
    const toastId = toast.loading('Guardando episodio...');
    if (btnRef.current) btnRef.current.style.transform = 'scale(0.97)';
    try {
      await createEpisode({
        episodeDate,
        episodeTime: form.time,
        symptoms: form.symptoms,
        symptomsNote: form.symptomsNote || undefined,
        glucoseAtEpisode: form.glucoseEnabled ? form.glucoseAtEpisode : undefined,
        interventionType: form.interventionType ?? undefined,
        interventionNote: undefined,
        glucoseAfterIntervention: form.postGlucoseEnabled ? form.postGlucose : undefined,
        recoveryTime: form.recoveryTime ?? undefined,
        severity: form.severity ?? 'MILD',
        notes: form.notes || undefined,
        nightRecordId,
      });
      toast.success('Episodio guardado', {
        id: toastId,
        description: 'Quedó asociado a tu bitácora nocturna.',
      });
      setSubmitState('success');
      setTimeout(() => navigate(-1), 900);
    } catch {
      toast.error('No se pudo guardar el episodio', {
        id: toastId,
        description: 'Revisá la conexión o intentá de nuevo.',
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

  const showSymptomsNote =
    form.symptoms.length > 0 && !form.symptoms.includes('no_symptoms');

  const visualStatus =
    form.severity === 'SEVERE' ? 'severe' : form.glucoseEnabled ? glucoseToMedicalStatus(form.glucoseAtEpisode) : 'attention';
  const automaticDate = episodeDate;

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
        <div className="w-9" />
      </div>

      {/* Step content */}
      <Card
        className={`relative flex-1 overflow-hidden p-5 transition-all duration-300 ease-out ${slideClass}`}
        style={{ transitionProperty: 'opacity, transform' }}
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-28 rounded-full bg-severeRed/10 blur-3xl" />
        <div className="relative">
        {/* Step 0 — Glucose at episode */}
        {step === 0 && (
          <div className="space-y-5">
            {form.glucoseEnabled && (
              <GlucoseOrb value={form.glucoseAtEpisode} status={visualStatus} label="Durante episodio" size="sm" />
            )}
            <div className="rounded-3xl border border-severeRed/20 bg-severeRed/10 px-4 py-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                Fecha y hora automáticas
              </p>
              <p className="mt-1 text-sm font-bold text-text-primary">
                {formatDate(automaticDate)} · {formatTime(form.time)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsEditingDateTime((prev) => {
                  const next = !prev;
                  if (!next) {
                    setEpisodeDate(today());
                    set('time', nowTime());
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
                    value={episodeDate}
                    onChange={(e) => setEpisodeDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-2 py-2 text-sm font-semibold normal-case tracking-normal text-text-primary outline-none focus:border-severeRed/60"
                  />
                </label>
                <label className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  Hora
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => set('time', e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-2 py-2 text-sm font-semibold normal-case tracking-normal text-text-primary outline-none focus:border-severeRed/60"
                  />
                </label>
              </div>
            )}
            <h2 className="text-xl font-bold text-text-primary text-center">
              ¿Te mediste durante el episodio?
            </h2>
            {/* Toggle */}
            <div className="flex justify-center gap-3">
              {['Sí, me medí', 'No me medí'].map((label, i) => {
                const active = i === 0 ? form.glucoseEnabled : !form.glucoseEnabled;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => set('glucoseEnabled', i === 0)}
                    className="min-h-[44px] rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                    style={{
                      borderColor: active ? 'rgba(251,113,133,0.42)' : 'rgba(255,255,255,0.1)',
                      background: active ? 'rgba(251,113,133,0.14)' : 'rgba(255,255,255,0.08)',
                      color: active ? 'var(--gaga-danger)' : 'var(--gaga-text-dim)',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {/* Slider only if enabled */}
            {form.glucoseEnabled && (
              <div
                style={{
                  animation: 'fadeIn 200ms ease-out',
                }}
              >
                <GlucoseSlider
                  value={form.glucoseAtEpisode}
                  onChange={(v) =>
                    setForm((current) => ({
                      ...current,
                      glucoseAtEpisode: v,
                      severity: severityFromGlucose(v),
                    }))
                  }
                  min={10}
                  max={300}
                  showValueDisplay={false}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 1 — Severity */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary text-center">
              ¿Qué tan severo fue?
            </h2>
            <SnappedSlider
              options={SEVERITY_OPTIONS}
              value={form.severity}
              onChange={(v) => set('severity', v as EpisodeSeverity)}
            />
          </div>
        )}

        {/* Step 2 — Symptoms */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary text-center">
              ¿Qué sentiste?
            </h2>
            <SymptomChips
              selected={form.symptoms}
              onChange={(v) => set('symptoms', v)}
            />
            {showSymptomsNote && (
              <div style={{ animation: 'fadeIn 200ms ease-out' }}>
                <textarea
                  value={form.symptomsNote}
                  onChange={(e) => set('symptomsNote', e.target.value)}
                  placeholder="Algo más que quieras anotar..."
                  className="glass-input w-full rounded-2xl border border-white/10 px-4 py-3
                    text-text-primary placeholder:text-text-secondary/40 focus:outline-none
                    focus:border-accent transition-colors resize-none min-h-[70px] text-sm mt-2"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Intervention */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary text-center">
              ¿Cómo lo resolviste?
            </h2>
            <PillSelect
              options={INTERVENTION_OPTIONS}
              value={form.interventionType}
              onChange={(v) => set('interventionType', v)}
            />
          </div>
        )}

        {/* Step 4 — Post-intervention */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary text-center">
              ¿Cómo quedaste después?
            </h2>

            {/* Post-glucose toggle */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-text-secondary text-center">
                ¿Te mediste después? (opcional)
              </p>
              <div className="flex justify-center gap-3">
                {(['Sí', 'No'] as const).map((label, i) => {
                  const active = i === 0 ? form.postGlucoseEnabled : !form.postGlucoseEnabled;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => set('postGlucoseEnabled', i === 0)}
                    className="min-h-[44px] rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                      style={{
                        borderColor: active ? 'rgba(110,231,183,0.42)' : 'rgba(255,255,255,0.1)',
                        background: active ? 'rgba(110,231,183,0.12)' : 'rgba(255,255,255,0.08)',
                        color: active ? 'var(--gaga-success)' : 'var(--gaga-text-dim)',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {form.postGlucoseEnabled && (
                <div style={{ animation: 'fadeIn 200ms ease-out' }}>
                  <GlucoseSlider
                    value={form.postGlucose}
                    onChange={(v) => set('postGlucose', v)}
                    min={10}
                    max={400}
                  />
                </div>
              )}
            </div>

            {/* Recovery time snapped slider */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-text-secondary text-center">
                ¿Cuánto tardaste en recuperarte? (opcional)
              </p>
              <SnappedSlider
                options={RECOVERY_OPTIONS}
                value={form.recoveryTime}
                onChange={(v) => set('recoveryTime', v)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">Notas (opcional)</p>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Observaciones adicionales..."
                className="glass-input w-full rounded-2xl border border-white/10 px-4 py-3
                  text-text-primary placeholder:text-text-secondary/40 focus:outline-none
                  focus:border-accent transition-colors resize-none min-h-[70px] text-sm"
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
            variant={visualStatus === 'severe' ? 'danger' : 'primary'}
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
            variant={visualStatus === 'severe' ? 'danger' : 'primary'}
          >
            {submitState === 'success' ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" style={{ strokeDasharray: 100, strokeDashoffset: 0, animation: 'drawCheck 400ms ease-out forwards' }} />
                </svg>
                ¡Guardado!
              </>
            ) : submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Guardando…
              </>
            ) : (
              'Registrar episodio'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
