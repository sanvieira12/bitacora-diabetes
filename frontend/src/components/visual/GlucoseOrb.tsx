import { motion, useReducedMotion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { MedicalVisualStatus } from '../../lib/medicalVisualState';

export type GlucoseOrbStatus = MedicalVisualStatus;

interface GlucoseOrbProps {
  value?: number;
  unit?: string;
  status?: GlucoseOrbStatus;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showUnit?: boolean;
}

const statusTone: Record<GlucoseOrbStatus, { ring: string; glow: string; text: string; label: string }> = {
  stable: {
    ring: 'from-calmGreen/70 via-medicalBlue/80 to-calmGreen/50',
    glow: 'rgba(110, 231, 183, 0.28)',
    text: 'text-calmGreen',
    label: 'Estado estable',
  },
  attention: {
    ring: 'from-alertAmber/80 via-orange-400/70 to-medicalBlue/55',
    glow: 'rgba(251, 191, 36, 0.25)',
    text: 'text-alertAmber',
    label: 'Requiere atención',
  },
  severe: {
    ring: 'from-severeRed/90 via-red-900/80 to-slate-950',
    glow: 'rgba(251, 113, 133, 0.28)',
    text: 'text-severeRed',
    label: 'Hipoglucemia severa',
  },
  unknown: {
    ring: 'from-medicalBlue/55 via-slate-500/50 to-slate-900',
    glow: 'rgba(99, 179, 255, 0.18)',
    text: 'text-medicalBlue',
    label: 'Sin registro reciente',
  },
};

const sizeMap = {
  sm: {
    shell: 'h-40 w-40',
    inner: 'inset-5',
    value: 'text-4xl',
    icon: 18,
  },
  md: {
    shell: 'h-64 w-64 sm:h-72 sm:w-72',
    inner: 'inset-8',
    value: 'text-6xl',
    icon: 24,
  },
  lg: {
    shell: 'h-72 w-72 sm:h-80 sm:w-80',
    inner: 'inset-9',
    value: 'text-7xl',
    icon: 26,
  },
};

export function GlucoseOrb({ value, unit = 'mg/dL', status = 'unknown', label, size = 'md', className, showUnit = true }: GlucoseOrbProps) {
  const reducedMotion = useReducedMotion();
  const tone = statusTone[status];
  const sizing = sizeMap[size];
  const ariaLabel = value
    ? `${label ?? tone.label}. Glucosa ${value} ${unit}.`
    : `${label ?? tone.label}.`;

  return (
    <motion.div
      role="status"
      aria-label={ariaLabel}
      className={cn('relative mx-auto grid place-items-center', sizing.shell, className)}
      animate={reducedMotion ? undefined : { scale: [1, 1.018, 1] }}
      transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div
        className="absolute inset-3 rounded-full blur-2xl"
        style={{ background: tone.glow, boxShadow: `0 0 86px ${tone.glow}` }}
      />
      <motion.div
        className={cn('absolute inset-0 rounded-full bg-gradient-to-br p-px opacity-95', tone.ring)}
        animate={reducedMotion ? undefined : { rotate: [0, 6, -4, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="h-full w-full rounded-full bg-night-950/72 shadow-[inset_0_0_48px_rgba(255,255,255,0.08)] backdrop-blur-xl" />
      </motion.div>
      <div className={cn('absolute rounded-full border border-white/10 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]', sizing.inner)} />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className={cn('mb-3 rounded-full border border-white/10 bg-white/5 p-2.5', tone.text)}>
          <Activity size={sizing.icon} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
          {label ?? tone.label}
        </span>
        <span className={cn('mt-2 font-extrabold leading-none tracking-tight text-text-primary', sizing.value)}>
          {value ?? '--'}
        </span>
        {showUnit && (
          <span className={cn('mt-2 text-sm font-semibold', tone.text)}>
            {value ? unit : 'Sin dato reciente'}
          </span>
        )}
      </div>
    </motion.div>
  );
}
