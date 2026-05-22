import client from './client';
import type {
  ApiResponse,
  StatisticsSummary,
  GlucoseTrendPoint,
  EpisodeFrequencyPoint,
  FactorFrequency,
} from '../types';

export async function getStatisticsSummary(from: string, to: string): Promise<StatisticsSummary> {
  const res = await client.get<ApiResponse<StatisticsSummary>>('/api/statistics/summary', {
    params: { from, to },
  });
  return res.data.data;
}

export async function getGlucoseTrend(from: string, to: string): Promise<GlucoseTrendPoint[]> {
  const res = await client.get<ApiResponse<GlucoseTrendPoint[]>>('/api/statistics/glucose-trend', {
    params: { from, to },
  });
  return res.data.data;
}

export async function getEpisodeFrequency(
  from: string,
  to: string,
  groupBy: 'week' | 'month' = 'week'
): Promise<EpisodeFrequencyPoint[]> {
  const res = await client.get<ApiResponse<EpisodeFrequencyPoint[]>>(
    '/api/statistics/episode-frequency',
    { params: { from, to, groupBy } }
  );
  return res.data.data;
}

export async function getFactors(from: string, to: string): Promise<FactorFrequency[]> {
  const res = await client.get<ApiResponse<FactorFrequency[]>>('/api/statistics/factors', {
    params: { from, to },
  });
  return res.data.data;
}
