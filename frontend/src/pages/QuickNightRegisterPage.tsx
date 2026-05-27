import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Drawer } from 'vaul';
import { toast } from 'sonner';
import { ArrowLeft, Check, Clock3, Droplets, Save, ShieldAlert } from 'lucide-react';
import { createNightRecord } from '../api/nightRecords';
import { createEpisode } from '../api/episodes';
import { NightBackground } from '../components/visual/NightBackground';
import { AnimatedPage } from '../components/visual/AnimatedPage';
import { GlucoseOrb, type GlucoseOrbStatus } from '../components/visual/GlucoseOrb';
import { useLateNightMode } from '../hooks/useLateNightMode';
import { glucoseToMedicalStatus } from '../lib/medicalVisualState';
import { nowTime, today } from '../lib/dateUtils';
import { cn } from '../lib/cn';

const SNACK_OPTIONS = ['Agua con azúcar', 'Miel', 'Otro'] as const;
type SnackOption = (typeof SNACK_OPTIONS)[number];

function statusFromGlucose(value: number | null): GlucoseOrbStatus {
  return glucoseToMedicalStatus(value);
}

function clampGlucose(value: number) {
  return Math.min(500, Math.max(10, value));
}

export function QuickNightRegisterPage() {
  const navigate = useNavigate();
  const lateNight = useLateNightMode();
  const reducedMotion = useReducedMotion();
  const [glucose, setGlucose] = useState('90');
  const [snack, setSnack] = useState<SnackOption>('Agua con azúcar');
  const [otherSnack, setOtherSnack] = useState('');
  const [time, setTime] = useState(nowTime());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [animatedDetailsRef] = useAutoAnimate<HTMLDivElement>({
    duration: reducedMotion ? 0 : 180,
    easing: 'ease-out',
  });

  const glucoseValue = glucose === '' ? null : Number(glucose);
  const validGlucose = glucoseValue !== null && Number.isFinite(glucoseValue) && glucoseValue >= 10 && glucoseValue <= 500;
  const status = statusFromGlucose(validGlucose ? glucoseValue : null);
  const isSevere = status === 'severe';

  const intervention = useMemo(() => {
    if (snack === 'Otro') return otherSnack.trim();
    return snack;
  }, [otherSnack, snack]);

  const canSave = validGlucose && time.length >= 4 && (snack !== 'Otro' || intervention.length > 0) && !saving;

  const adjust = (delta: number) => {
    const current = glucoseValue ?? 90;
    setGlucose(String(clampGlucose(current + delta)));
    setError('');
  };

  const handleSave = async () => {
    if (!canSave || glucoseValue === null) return;
    setSaving(true);
    setError('');

    try {
      const toastId = toast.loading('Guardando registro nocturno...');
      const savedNight = await createNightRecord({
        date: today(),
        glucoseBeforeSleep: glucoseValue,
        bedtime: time,
        hadBedtimeSnack: true,
        snackDescription: intervention || undefined,
        sleepQuality: 'FAIR',
        physicalActivityToday: false,
        stressLevel: isSevere ? 'HIGH' : 'MEDIUM',
        alcohol: 'none',
        exerciseLevel: 'none',
        notes: [
          'Registro rápido.',
          isSevere ? `Hipoglucemia severa registrada (${glucoseValue} mg/dL).` : undefined,
          intervention ? `Intervención/snack: ${intervention}.` : undefined,
        ].filter(Boolean).join(' '),
      });

      if (isSevere) {
        try {
          await createEpisode({
            episodeDate: today(),
            nightRecordId: savedNight.id,
            episodeTime: time,
            glucoseAtEpisode: glucoseValue,
            severity: 'SEVERE',
            symptoms: ['hipoglucemia'],
            intervention: intervention || 'Agua con azúcar',
            interventionType: snack === 'Otro' ? 'other' : snack === 'Miel' ? 'candy' : 'agua_con_azucar',
            interventionNote: snack === 'Otro' ? intervention : undefined,
            notes: 'Registrado automáticamente desde Registro rápido.',
          });
        } catch (episodeError: unknown) {
          toast.warning('La noche quedó guardada, pero no pude crear el episodio automáticamente.', {
            id: toastId,
            description: episodeError instanceof Error ? episodeError.message : undefined,
          });
          setError('La noche quedó guardada. Revisá el episodio desde el detalle si hace falta.');
          setSaving(false);
          return;
        }
      }

      setSaved(true);
      toast.success(isSevere ? 'Registro y episodio guardados.' : 'Registro nocturno guardado.', { id: toastId });
      window.setTimeout(() => navigate('/', { replace: true }), reducedMotion ? 450 : 850);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'No se pudo guardar el registro.';
      setError(message);
      toast.error('No pude guardar el registro.', { description: message });
      setSaving(false);
    }
  };

  return (
    <div className={cn(
      'relative h-[100svh] overflow-hidden bg-background text-text-primary',
      lateNight && 'late-night-mode',
      isSevere && 'brightness-95 saturate-[0.9]'
    )}>
      <NightBackground lateNight={lateNight || isSevere} />

      <AnimatedPage className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col px-4 pb-[max(0.9rem,var(--gaga-safe-bottom))] pt-[max(0.75rem,var(--gaga-safe-top))]">
        <div className="flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-text-secondary backdrop-blur-xl transition hover:text-text-primary"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-text-secondary">Madrugada</p>
            <h1 className="text-base font-bold text-text-primary">Registro rápido</h1>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-medicalBlue backdrop-blur-xl">
            <Droplets size={20} />
          </div>
        </div>

        <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 py-2">
          <motion.div
            className="w-full"
            animate={reducedMotion || isSevere ? undefined : { y: [0, -4, 0] }}
            transition={{ duration: lateNight ? 8 : 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <GlucoseOrb
              value={validGlucose ? glucoseValue : undefined}
              status={status}
              label={isSevere ? 'Registro crítico' : 'Glucosa ahora'}
              showUnit={false}
              className="h-52 w-52 sm:h-56 sm:w-56 [&_span:nth-of-type(2)]:text-5xl"
            />
          </motion.div>

          <div className="w-full rounded-[2rem] border border-white/12 bg-night-950/55 p-3 shadow-glass backdrop-blur-2xl">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
              Glucosa ahora
            </p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => adjust(-5)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/12 bg-white/[0.08] text-xl font-extrabold text-text-primary transition hover:bg-white/15 active:scale-95"
                aria-label="Bajar glucosa"
              >
                -
              </button>
              <span className="min-w-16 text-center text-sm font-bold text-text-primary">mg/dL</span>
              <button
                type="button"
                onClick={() => adjust(5)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/12 bg-white/[0.08] text-xl font-extrabold text-text-primary transition hover:bg-white/15 active:scale-95"
                aria-label="Subir glucosa"
              >
                +
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isSevere ? (
              <motion.div
                key="severe"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex w-full items-start gap-2 rounded-3xl border border-severeRed/25 bg-severeRed/10 px-4 py-3 text-red-100"
              >
                <ShieldAlert size={18} className="mt-0.5 shrink-0 text-severeRed" />
                <p className="text-sm leading-5">Valor severo. Guardalo con calma y seguí tu protocolo indicado.</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <section ref={animatedDetailsRef} className="shrink-0 space-y-3">
          <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
            <Drawer.Trigger asChild>
              <button
                type="button"
                className="flex h-14 w-full items-center justify-between rounded-3xl border border-white/10 bg-white/10 px-4 text-left backdrop-blur-xl transition active:scale-[0.99]"
              >
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                    Intervención
                  </span>
                  <span className="block text-base font-bold text-text-primary">
                    {snack === 'Otro' ? otherSnack || 'Otro' : snack}
                  </span>
                </span>
                <span className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold',
                  isSevere ? 'border-severeRed/30 bg-severeRed/10 text-severeRed' : 'border-medicalBlue/30 bg-medicalBlue/10 text-medicalBlue'
                )}>
                  Cambiar
                </span>
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 z-50 bg-night-950/60 backdrop-blur-sm" />
              <Drawer.Content className="glass-panel fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[2rem] border-b-0 p-4 pb-[calc(1rem+var(--gaga-safe-bottom))] outline-none">
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
                <Drawer.Title className="text-center text-lg font-bold text-text-primary">
                  ¿Qué usaste?
                </Drawer.Title>
                <p className="mt-1 text-center text-sm text-text-secondary">
                  Elegí lo más cercano. Podés ajustar después.
                </p>
                <div className="mt-5 grid gap-2">
                  {SNACK_OPTIONS.map((option) => {
                    const active = snack === option;
                    return (
                      <Drawer.Close asChild key={option}>
                        <button
                          type="button"
                          onClick={() => {
                            setSnack(option);
                            setError('');
                          }}
                          className={cn(
                            'min-h-12 rounded-2xl border px-4 text-left text-sm font-semibold transition active:scale-[0.99]',
                            active
                              ? isSevere
                                ? 'border-severeRed/55 bg-severeRed/16 text-red-100'
                                : 'border-medicalBlue/55 bg-medicalBlue/15 text-white'
                              : 'border-white/12 bg-night-950/45 text-text-primary'
                          )}
                        >
                          {option}
                        </button>
                      </Drawer.Close>
                    );
                  })}
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>

          {snack === 'Otro' && (
            <input
              type="text"
              value={otherSnack}
              onChange={(e) => {
                setOtherSnack(e.target.value);
                setError('');
              }}
              placeholder="¿Qué tomaste o comiste?"
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-text-primary outline-none backdrop-blur-xl placeholder:text-text-secondary/60 focus:border-medicalBlue/60"
            />
          )}

          <div className="grid grid-cols-[1fr_1.55fr] gap-2">
            <label className="flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 text-sm text-text-secondary">
              <Clock3 size={16} />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-right font-semibold text-text-primary outline-none"
              />
            </label>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                'flex h-12 items-center justify-center gap-2 rounded-2xl border font-extrabold transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45',
                isSevere
                  ? 'border-severeRed/40 bg-severeRed/22 text-red-50 shadow-glowRed'
                  : 'border-medicalBlue/40 bg-medicalBlue/90 text-night-950 shadow-glowBlue'
              )}
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? 'Guardado' : saving ? 'Guardando' : 'Guardar'}
            </button>
          </div>

          {error && (
            <p className="rounded-2xl border border-severeRed/25 bg-severeRed/10 px-3 py-2 text-center text-xs leading-5 text-red-100">
              {error}
            </p>
          )}
        </section>
      </AnimatedPage>
    </div>
  );
}
