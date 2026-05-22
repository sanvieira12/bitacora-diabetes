import client from './client';
import type { ApiResponse, NightRecord, NightRecordRequest, NightRecordSummary } from '../types';

export interface NightRecordFilters {
  from?: string;
  to?: string;
  hasEpisode?: boolean;
  attentionLevel?: string;
  page?: number;
  size?: number;
}

export async function getNightRecords(
  filters: NightRecordFilters = {}
): Promise<ApiResponse<NightRecordSummary[]>> {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.hasEpisode !== undefined) params.set('hasEpisode', String(filters.hasEpisode));
  if (filters.attentionLevel) params.set('attentionLevel', filters.attentionLevel);
  if (filters.page !== undefined) params.set('page', String(filters.page));
  if (filters.size !== undefined) params.set('size', String(filters.size));

  const res = await client.get<ApiResponse<NightRecordSummary[]>>('/api/night-records', { params });
  return res.data;
}

export async function getNightRecord(id: string): Promise<NightRecord> {
  const res = await client.get<ApiResponse<NightRecord>>(`/api/night-records/${id}`);
  return res.data.data;
}

export async function createNightRecord(request: NightRecordRequest): Promise<NightRecord> {
  const res = await client.post<ApiResponse<NightRecord>>('/api/night-records', request);
  return res.data.data;
}

export async function updateNightRecord(id: string, request: NightRecordRequest): Promise<NightRecord> {
  const res = await client.put<ApiResponse<NightRecord>>(`/api/night-records/${id}`, request);
  return res.data.data;
}

export async function deleteNightRecord(id: string): Promise<void> {
  await client.delete(`/api/night-records/${id}`);
}
