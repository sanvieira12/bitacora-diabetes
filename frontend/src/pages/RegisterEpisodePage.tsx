import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { GlucoseSlider } from '../components/forms/GlucoseSlider';
import { SnappedSlider } from '../components/forms/SnappedSlider';
import { SymptomChips } from '../components/forms/SymptomChips';
import { PillSelect } from '../components/forms/PillSelect';
import { createEpisode } from '../api/episodes';
import { nowTime } from '../lib/dateUtils';
import type { EpisodeSeverity } from '../types';

// ── Slider option sets ────────────────────────────────────────────────────────

const SEVERITY_OPTIONS = [
  { value: 'MILD',     label: '😰 Leve',     color: 'var(--gaga-accent)' },
  { value: 'MODERATE', label: '😟 Moderado', color: '#fb923c' },
  { value: 'SEVERE',   label: '🚨 Severo',   color: 'var(--gaga-danger)' },
];

const RECOVERY_OPTIONS = [
  { value: 'FAST',      label: '⚡ < 15 min',    color: 'var(--gaga-success)' },
  { value: 'NORMAL',    label: '🕐 15–30 min',   color: 'var(--gaga-accent)' },
  { value: 'SLOW',      label: '⏳ 30–60 min',   color: '#fb923c' },
  { value: 'VERY_SLOW', label: '🌙 + de 1 hora', color: 'var(--gaga-danger)' },
];

const INTERVENTION_OPTIONS = [
  { value: 'juice',        label: '🧃 Tomé jugo' },
  { value: 'glucose_tabs', label: '💊 Comprimidos de glucosa' },
  { value: 'candy',        label: '🍬 Comí algo dulce' },
  { value: 'glucagon',     label: '💉 Glucagón' },
  { value: 'nothing',      label: '🤷 Se pasó solo' },
  { value: 'other',        label: '✏️ Otra cosa' },
];

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = ['Hora', 'Glucosa', 'Severidad', 'Síntomas', 'Intervención', 'Después'];

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
  const btnRef = useRef<HTMLButtonElement>(null);

  const [form, setForm] = useState<FormState>({
    time: nowTime(),
    glucoseAtEpisode: 55,
    glucoseEnabled: true,
    severity: null,
    symptoms: [],
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
    if (step === 0) return form.time.length >= 4;
    if (step === 2 && form.severity === null) return false;
    if (step === 3 && form.symptoms.length === 0) return false;
    if (step === 4 && form.interventionType === null) return false;
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
    if (btnRef.current) btnRef.current.style.transform = 'scale(0.97)';
    try {
      await createEpisode({
        episodeTime: form.time,
        symptoms: form.symptoms,
        symptomsNote: form.symptomsNote || undefined,
        glucoseAtEpisode: form.glucoseEnabled ? form.glucoseAtEpisode : undefined,
        interventionType: form.interventionType ?? undefined,
        interventionNote:
          form.interventionType === 'other' ? form.interventionNote || undefined : undefined,
        glucoseAfterIntervention: form.postGlucoseEnabled ? form.postGlucose : undefined,
        recoveryTime: form.recoveryTime ?? undefined,
        severity: form.severity ?? 'MILD',
        notes: form.notes || undefined,
        nightRecordId,
      });
      setSubmitState('success');
      setTimeout(() => navigate(-1), 900);
    } catch {
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => (step > 0 ? goStep(step - 1) : navigate(-1))}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-text-secondary"
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
      <div
        className={`flex-1 transition-all duration-250 ease-out ${slideClass}`}
        style={{ transitionProperty: 'opacity, transform' }}
      >
        {/* Step 0 — Time */}
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary text-center">
              ¿A qué hora fue?
            </h2>
            <div className="flex justify-center">
              <input
                type="time"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
                className="text-4xl font-bold text-center bg-surface-2 border-2 border-white/10
                  rounded-2xl px-6 py-4 text-text-primary focus:outline-none
                  focus:border-[var(--gaga-danger)] transition-colors w-full max-w-xs"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        )}

        {/* Step 1 — Glucose at episode */}
        {step === 1 && (
          <div className="space-y-5">
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
                    className="px-5 py-2 rounded-full text-sm font-medium border-2 transition-all duration-150"
                    style={{
                      borderColor: active ? 'var(--gaga-danger)' : 'transparent',
                      background: active ? 'rgba(248,113,113,0.15)' : 'var(--gaga-surface-2)',
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
                  onChange={(v) => set('glucoseAtEpisode', v)}
                  min={10}
                  max={300}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Severity */}
        {step === 2 && (
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

        {/* Step 3 — Symptoms */}
        {step === 3 && (
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
                  className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3
                    text-text-primary placeholder:text-text-secondary/40 focus:outline-none
                    focus:border-accent transition-colors resize-none min-h-[70px] text-sm mt-2"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 4 — Intervention */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary text-center">
              ¿Cómo lo resolviste?
            </h2>
            <PillSelect
              options={INTERVENTION_OPTIONS}
              value={form.interventionType}
              onChange={(v) => set('interventionType', v)}
            />
            {form.interventionType === 'other' && (
              <div style={{ animation: 'fadeIn 200ms ease-out' }}>
                <textarea
                  value={form.interventionNote}
                  onChange={(e) => set('interventionNote', e.target.value)}
                  placeholder="¿Qué hiciste exactamente?"
                  className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3
                    text-text-primary placeholder:text-text-secondary/40 focus:outline-none
                    focus:border-accent transition-colors resize-none min-h-[70px] text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 5 — Post-intervention */}
        {step === 5 && (
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
                      className="px-5 py-2 rounded-full text-sm font-medium border-2 transition-all duration-150"
                      style={{
                        borderColor: active ? 'var(--gaga-success)' : 'transparent',
                        background: active ? 'rgba(74,222,128,0.12)' : 'var(--gaga-surface-2)',
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
                className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3
                  text-text-primary placeholder:text-text-secondary/40 focus:outline-none
                  focus:border-accent transition-colors resize-none min-h-[70px] text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="mt-6 pt-4">
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => goStep(step + 1)}
            disabled={!canAdvance()}
            className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2
              transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--gaga-danger)', color: '#fff' }}
          >
            Siguiente
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            ref={btnRef}
            onClick={handleSubmit}
            disabled={!canAdvance() || submitting}
            className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2
              transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
              ${shake ? 'animate-shake' : ''}`}
            style={{ background: 'var(--gaga-danger)', color: '#fff' }}
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
              'Registrar episodio 📋'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
