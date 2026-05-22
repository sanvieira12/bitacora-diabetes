import { useState, useEffect, useCallback } from 'react';
import { getNightRecords } from '../api/nightRecords';
import type { NightRecordSummary, PageMeta } from '../types';
import type { NightRecordFilters } from '../api/nightRecords';

interface UseNightRecordsResult {
  records: NightRecordSummary[];
  loading: boolean;
  error: string | null;
  page: PageMeta | null;
  refetch: () => void;
}

export function useNightRecords(filters: NightRecordFilters = {}): UseNightRecordsResult {
  const [records, setRecords] = useState<NightRecordSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getNightRecords(filters)
      .then((res) => {
        if (!cancelled) {
          setRecords(res.data);
          setPageMeta(res.page ?? null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, JSON.stringify(filters)]);

  return { records, loading, error, page: pageMeta, refetch };
}
