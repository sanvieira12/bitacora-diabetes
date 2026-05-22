import { useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings } from '../api/settings';
import type { AppSettings } from '../types';

interface UseSettingsResult {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  saveError: string | null;
  save: (data: Partial<Omit<AppSettings, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  refetch: () => void;
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getSettings()
      .then((s) => {
        if (!cancelled) setSettings(s);
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
  }, [tick]);

  const save = useCallback(
    async (data: Partial<Omit<AppSettings, 'id' | 'createdAt' | 'updatedAt'>>) => {
      setSaving(true);
      setSaveError(null);
      try {
        const updated = await updateSettings(data);
        setSettings(updated);
      } catch (err: unknown) {
        setSaveError(err instanceof Error ? err.message : 'Error al guardar');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return { settings, loading, error, saving, saveError, save, refetch };
}
