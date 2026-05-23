export type AttentionLevel = 'GREEN' | 'YELLOW' | 'RED';
export type SleepQuality = 'GOOD' | 'FAIR' | 'POOR';
export type StressLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type EpisodeSeverity = 'MILD' | 'MODERATE' | 'SEVERE';

export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  details?: string[];
  page?: PageMeta;
}

export interface NightRecord {
  id: string;
  date: string;
  glucoseBeforeSleep: number;
  glucoseWakeup?: number;
  hadBedtimeSnack: boolean;
  snackDescription?: string;
  bedtime: string;
  wakeTime?: string;
  sleepQuality: SleepQuality;
  physicalActivityToday: boolean;
  stressLevel: StressLevel;
  notes?: string;
  alcohol?: string;
  dinnerType?: string;
  exerciseLevel?: string;
  attentionLevel: AttentionLevel;
  attentionReasons: string[];
  episodes?: EpisodeRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface NightRecordSummary {
  id: string;
  date: string;
  glucoseBeforeSleep: number;
  attentionLevel: AttentionLevel;
  attentionReasons: string[];
  hadBedtimeSnack: boolean;
  hasEpisodes: boolean;
  sleepQuality: SleepQuality;
  stressLevel: StressLevel;
  notes?: string;
}

export interface EpisodeRecord {
  id: string;
  nightRecordId?: string;
  nightRecordDate?: string;
  episodeDate: string;
  episodeTime: string;
  symptoms: string[];
  glucoseAtEpisode?: number;
  intervention: string;
  glucoseAfterIntervention?: number;
  recoveryTimeMinutes?: number;
  severity: EpisodeSeverity;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  id: string;
  lowGlucoseThreshold: number;
  criticalGlucoseThreshold: number;
  bedtimeTargetMin: number;
  bedtimeTargetMax: number;
  highGlucoseThreshold: number;
  emergencyProtocolText: string;
  doctorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatisticsSummary {
  totalNights: number;
  totalEpisodes: number;
  avgGlucoseBeforeSleep: number;
  minGlucoseBeforeSleep: number;
  maxGlucoseBeforeSleep: number;
  nightsWithEpisode: number;
  episodeRate: number;
  nightsGreen: number;
  nightsYellow: number;
  nightsRed: number;
  avgRecoveryTimeMinutes: number;
}

export interface GlucoseTrendPoint {
  date: string;
  glucoseBeforeSleep: number;
  attentionLevel: AttentionLevel;
}

export interface EpisodeFrequencyPoint {
  period: string;
  count: number;
}

export interface FactorFrequency {
  factor: string;
  count: number;
  percentage: number;
}

export interface DoctorSummary {
  personName: string;
  from: string;
  to: string;
  generatedAt: string;
  statistics: StatisticsSummary;
  glucoseTrend: GlucoseTrendPoint[];
  episodes: EpisodeRecord[];
  emergencyProtocolText: string;
  doctorNotes?: string;
  disclaimer: string;
}

export interface NightRecordRequest {
  glucoseBeforeSleep: number;
  glucoseWakeup?: number;
  hadBedtimeSnack: boolean;
  snackDescription?: string;
  bedtime: string;
  wakeTime?: string;
  sleepQuality: SleepQuality;
  physicalActivityToday: boolean;
  stressLevel: StressLevel;
  notes?: string;
  alcohol?: string;
  dinnerType?: string;
  exerciseLevel?: string;
}

export interface ProgressData {
  totalNights: number;
  currentGoal: number;
  previousGoal: number;
  goalLabel: string;
  percentComplete: number;
  nightsToGo: number;
  isNewGoalUnlocked: boolean;
}

export interface EpisodeRequest {
  episodeDate: string;
  episodeTime: string;
  symptoms: string[];
  glucoseAtEpisode?: number;
  intervention: string;
  glucoseAfterIntervention?: number;
  recoveryTimeMinutes?: number;
  severity: EpisodeSeverity;
  notes?: string;
  nightRecordId?: string;
}
