import client from './client';
import type { ApiResponse, EpisodeRecord, EpisodeRequest } from '../types';

export interface EpisodeFilters {
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export async function getEpisodes(
  filters: EpisodeFilters = {}
): Promise<ApiResponse<EpisodeRecord[]>> {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.page !== undefined) params.set('page', String(filters.page));
  if (filters.size !== undefined) params.set('size', String(filters.size));

  const res = await client.get<ApiResponse<EpisodeRecord[]>>('/api/episodes', { params });
  return res.data;
}

export async function getEpisode(id: string): Promise<EpisodeRecord> {
  const res = await client.get<ApiResponse<EpisodeRecord>>(`/api/episodes/${id}`);
  return res.data.data;
}

export async function createEpisode(request: EpisodeRequest): Promise<EpisodeRecord> {
  const res = await client.post<ApiResponse<EpisodeRecord>>('/api/episodes', request);
  return res.data.data;
}

export async function updateEpisode(id: string, request: EpisodeRequest): Promise<EpisodeRecord> {
  const res = await client.put<ApiResponse<EpisodeRecord>>(`/api/episodes/${id}`, request);
  return res.data.data;
}

export async function deleteEpisode(id: string): Promise<void> {
  await client.delete(`/api/episodes/${id}`);
}
