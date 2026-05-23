import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { GlucoseSlider } from '../components/forms/GlucoseSlider';
import { PillSelect } from '../components/forms/PillSelect';
import { createNightRecord } from '../api/nightRecords';
import type { SleepQuality, StressLevel } from '../types';

const ALCOHOL_OPTIONS = [
  { value: 'none',     label: '🚫 Cero alcoholes' },
  { value: 'little',  label: '🍷 Algo tomé' },
  { value: 'moderate',label: '🍻 Bastante' },
  { value: 'a_lot',   label: '🫠 Demasiado, obvio' },
];

const DINNER_OPTIONS = [
  { value: 'nothing',    label: '😶 No comí nada' },
  { value: 'light',      label: '🥗 Comí liviano' },
  { value: 'normal',     label: '🍽️ Normal' },
  { value: 'heavy',      label: '🤤 Me pasé un poco' },
  { value: 'very_heavy', label: '💀 Me mandé una bestialidad' },
];

const EXERCISE_OPTIONS = [
  { value: 'none',     label: '🛋️ Sofá mode activado' },
  { value: 'light',   label: '🚶 Algo moví el cuerpo' },
  { value: 'moderate',label: '🚴 Ejercité bien' },
  { value: 'intense', label: '🏋️ Entrenamiento de combate' },
];

const SLEEP_OPTIONS = [
  { value: 'GOOD', label: '😴 Buena' },
  { value: 'FAIR', label: '😐 Regular' },
  { value: 'POOR', label: '😩 Mala' },
];

const STRESS_OPTIONS = [
  { value: 'LOW',    label: '😌 Bajo' },
  { value: 'MEDIUM', label: '😤 Moderado' },
  { value: 'HIGH',   label: '🤯 Alto' },
];

interface FormState {
  glucoseBeforeSleep: number;
  bedtime: string;
  alcohol: string | null;
  dinnerType: string | null;
  exerciseLevel: string | null;
  sleepQuality: SleepQuality | null;
  stressLevel: StressLevel | null;
  notes: string;
}

const STEPS = ['Glucosa', 'Hora', 'Alcohol', 'Cena', 'Ejercicio', 'Sueño'];

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
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [shake, setShake] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const [form, setForm] = useState<FormState>({
    glucoseBeforeSleep: 120,
    bedtime: '23:00',
    alcohol: null,
    dinnerType: null,
    exerciseLevel: null,
    sleepQuality: null,
    stressLevel: null,
    notes: '',
  });

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const canAdvance = (): boolean => {
    if (step === 2 && form.alcohol === null) return false;
    if (step === 3 && form.dinnerType === null) return false;
    if (step === 4 && form.exerciseLevel === null) return false;
    if (step === 5 && (form.sleepQuality === null || form.stressLevel === null)) return false;
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
      await createNightRecord({
        glucoseBeforeSleep: form.glucoseBeforeSleep,
        bedtime: form.bedtime,
        hadBedtimeSnack: false,
        sleepQuality: form.sleepQuality ?? 'GOOD',
        physicalActivityToday: form.exerciseLevel !== 'none' && form.exerciseLevel !== null,
        stressLevel: form.stressLevel ?? 'LOW',
        notes: form.notes || undefined,
        alcohol: form.alcohol ?? undefined,
        dinnerType: form.dinnerType ?? undefined,
        exerciseLevel: form.exerciseLevel ?? undefined,
      });
      setSubmitState('success');
      setTimeout(() => navigate('/'), 900);
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
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary text-center">
              ¿Cuánto tenés de glucosa?
            </h2>
            <p className="text-center text-text-secondary text-sm">Antes de dormir</p>
            <GlucoseSlider
              value={form.glucoseBeforeSleep}
              onChange={(v) => set('glucoseBeforeSleep', v)}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary text-center">
              ¿A qué hora te vas a dormir?
            </h2>
            <div className="flex justify-center">
              <input
                type="time"
                value={form.bedtime}
                onChange={(e) => set('bedtime', e.target.value)}
                className="text-4xl font-bold text-center bg-surface-2 border-2 border-white/10
                  rounded-2xl px-6 py-4 text-text-primary focus:outline-none focus:border-accent
                  transition-colors w-full max-w-xs"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary text-center">
              ¿Tomaste alcohol?
            </h2>
            <PillSelect
              options={ALCOHOL_OPTIONS}
              value={form.alcohol}
              onChange={(v) => set('alcohol', v)}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary text-center">
              ¿Cómo fue la cena?
            </h2>
            <PillSelect
              options={DINNER_OPTIONS}
              value={form.dinnerType}
              onChange={(v) => set('dinnerType', v)}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary text-center">
              ¿Hiciste ejercicio hoy?
            </h2>
            <PillSelect
              options={EXERCISE_OPTIONS}
              value={form.exerciseLevel}
              onChange={(v) => set('exerciseLevel', v)}
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text-primary text-center">
              Últimos detalles
            </h2>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-text-secondary">Calidad del sueño</label>
              <PillSelect
                options={SLEEP_OPTIONS}
                value={form.sleepQuality}
                onChange={(v) => set('sleepQuality', v as SleepQuality)}
              />
            </div>
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
                className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3
                  text-text-primary placeholder:text-text-secondary/40 focus:outline-none
                  focus:border-accent transition-colors resize-none min-h-[80px]"
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
            style={{ background: 'var(--gaga-accent)', color: '#0a0a12' }}
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
            style={{ background: 'var(--gaga-accent)', color: '#0a0a12' }}
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
              <>Registrar noche ✨</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
