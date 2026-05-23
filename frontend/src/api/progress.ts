import client from './client';
import type { ApiResponse, ProgressData } from '../types';

export async function getProgress(): Promise<ProgressData> {
  const res = await client.get<ApiResponse<ProgressData>>('/api/progress');
  return res.data.data;
}
