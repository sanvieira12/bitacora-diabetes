/**
 * Returns today's date as an ISO string (YYYY-MM-DD).
 */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns the date n days ago as an ISO string (YYYY-MM-DD).
 */
export function nDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns the current time as HH:mm.
 */
export function nowTime(): string {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
