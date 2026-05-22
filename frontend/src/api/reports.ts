import client from './client';
import type { ApiResponse, DoctorSummary } from '../types';

export async function getDoctorSummary(from: string, to: string): Promise<DoctorSummary> {
  const res = await client.get<ApiResponse<DoctorSummary>>('/api/reports/doctor-summary', {
    params: { from, to },
  });
  return res.data.data;
}

export function downloadPdf(from: string, to: string): void {
  const url = `/api/reports/export/pdf?from=${from}&to=${to}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `gluconoche-informe-${from}-${to}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadCsv(from: string, to: string): void {
  const url = `/api/reports/export/csv?from=${from}&to=${to}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `gluconoche-datos-${from}-${to}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
