import type { AttentionLevel } from '../types';

export type MedicalVisualStatus = 'stable' | 'attention' | 'severe' | 'unknown';

export function glucoseToMedicalStatus(value?: number | null): MedicalVisualStatus {
  if (value == null || Number.isNaN(value)) return 'unknown';
  if (value < 54) return 'severe';
  if (value < 80 || value > 180) return 'attention';
  return 'stable';
}

export function attentionToMedicalStatus(level?: AttentionLevel | null): MedicalVisualStatus {
  if (!level) return 'unknown';
  if (level === 'RED') return 'severe';
  if (level === 'YELLOW') return 'attention';
  return 'stable';
}

export function nightRecordToMedicalStatus(record?: { glucoseBeforeSleep: number; attentionLevel?: AttentionLevel } | null): MedicalVisualStatus {
  if (!record) return 'unknown';
  const glucoseStatus = glucoseToMedicalStatus(record.glucoseBeforeSleep);
  if (glucoseStatus === 'severe') return glucoseStatus;
  return attentionToMedicalStatus(record.attentionLevel);
}

export const medicalTone = {
  stable: {
    text: 'text-calmGreen',
    border: 'border-calmGreen/35',
    bg: 'bg-calmGreen/10',
    glow: 'shadow-[0_0_34px_rgba(110,231,183,0.22)]',
  },
  attention: {
    text: 'text-alertAmber',
    border: 'border-alertAmber/35',
    bg: 'bg-alertAmber/10',
    glow: 'shadow-[0_0_34px_rgba(251,191,36,0.18)]',
  },
  severe: {
    text: 'text-severeRed',
    border: 'border-severeRed/35',
    bg: 'bg-severeRed/10',
    glow: 'shadow-[0_0_34px_rgba(251,113,133,0.18)]',
  },
  unknown: {
    text: 'text-medicalBlue',
    border: 'border-medicalBlue/25',
    bg: 'bg-medicalBlue/10',
    glow: 'shadow-[0_0_28px_rgba(99,179,255,0.14)]',
  },
} as const satisfies Record<MedicalVisualStatus, {
  text: string;
  border: string;
  bg: string;
  glow: string;
}>;
