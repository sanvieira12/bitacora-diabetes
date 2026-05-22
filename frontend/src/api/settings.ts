import client from './client';
import type { ApiResponse, AppSettings } from '../types';

export async function getSettings(): Promise<AppSettings> {
  const res = await client.get<ApiResponse<AppSettings>>('/api/settings');
  return res.data.data;
}

export async function updateSettings(
  data: Partial<Omit<AppSettings, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<AppSettings> {
  const res = await client.put<ApiResponse<AppSettings>>('/api/settings', data);
  return res.data.data;
}
