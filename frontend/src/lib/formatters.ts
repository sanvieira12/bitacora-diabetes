import type { AttentionLevel, EpisodeSeverity, SleepQuality, StressLevel } from '../types';

export function formatDate(date: string): string {
  const d = new Date(date + 'T12:00:00'); // noon to avoid timezone shifts
  return d.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(time: string): string {
  // time is HH:mm or HH:mm:ss
  return time.slice(0, 5);
}

export function formatGlucoseValue(val: number): string {
  return String(val);
}

export function formatAttentionLevel(level: AttentionLevel): string {
  switch (level) {
    case 'GREEN':
      return 'Óptimo';
    case 'YELLOW':
      return 'Atención';
    case 'RED':
      return 'Urgente';
  }
}

export function formatSleepQuality(q: SleepQuality): string {
  switch (q) {
    case 'GOOD':
      return 'Buena';
    case 'FAIR':
      return 'Regular';
    case 'POOR':
      return 'Mala';
  }
}

export function formatStressLevel(s: StressLevel): string {
  switch (s) {
    case 'LOW':
      return 'Bajo';
    case 'MEDIUM':
      return 'Moderado';
    case 'HIGH':
      return 'Alto';
  }
}

export function formatSeverity(s: EpisodeSeverity): string {
  switch (s) {
    case 'MILD':
      return 'Leve';
    case 'MODERATE':
      return 'Moderado';
    case 'SEVERE':
      return 'Grave';
  }
}

export function getAttentionColor(level: AttentionLevel): string {
  switch (level) {
    case 'GREEN':
      return 'text-green-400';
    case 'YELLOW':
      return 'text-yellow-400';
    case 'RED':
      return 'text-red-400';
  }
}

export function getAttentionBgColor(level: AttentionLevel): string {
  switch (level) {
    case 'GREEN':
      return 'bg-green-400/20 border-green-400/40';
    case 'YELLOW':
      return 'bg-yellow-400/20 border-yellow-400/40';
    case 'RED':
      return 'bg-red-400/20 border-red-400/40';
  }
}
