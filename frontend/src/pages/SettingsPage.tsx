import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useSettings } from '../hooks/useSettings';

function NumberField({
  label,
  value,
  onChange,
  unit = 'mg/dL',
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-sm text-text-secondary flex-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary
            text-right focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <span className="text-xs text-text-secondary">{unit}</span>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { settings, loading, saving, saveError, save } = useSettings();
  const [form, setForm] = React.useState({
    lowGlucoseThreshold: 100,
    criticalGlucoseThreshold: 70,
    bedtimeTargetMin: 110,
    bedtimeTargetMax: 180,
    highGlucoseThreshold: 270,
    emergencyProtocolText: '',
    doctorNotes: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        lowGlucoseThreshold: settings.lowGlucoseThreshold,
        criticalGlucoseThreshold: settings.criticalGlucoseThreshold,
        bedtimeTargetMin: settings.bedtimeTargetMin,
        bedtimeTargetMax: settings.bedtimeTargetMax,
        highGlucoseThreshold: settings.highGlucoseThreshold,
        emergencyProtocolText: settings.emergencyProtocolText,
        doctorNotes: settings.doctorNotes ?? '',
      });
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save({
        ...form,
        doctorNotes: form.doctorNotes || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // error shown via saveError
    }
  };

  if (loading) return <LoadingSpinner className="py-12" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-text-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-text-primary">Configuración</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Thresholds */}
        <Card className="p-4">
          <h2 className="font-semibold text-text-primary mb-3">Umbrales de glucosa</h2>
          <NumberField
            label="Glucosa crítica (debajo de)"
            value={form.criticalGlucoseThreshold}
            onChange={(v) => setForm((f) => ({ ...f, criticalGlucoseThreshold: v }))}
          />
          <NumberField
            label="Glucosa baja (debajo de)"
            value={form.lowGlucoseThreshold}
            onChange={(v) => setForm((f) => ({ ...f, lowGlucoseThreshold: v }))}
          />
          <NumberField
            label="Objetivo nocturno mínimo"
            value={form.bedtimeTargetMin}
            onChange={(v) => setForm((f) => ({ ...f, bedtimeTargetMin: v }))}
          />
          <NumberField
            label="Objetivo nocturno máximo"
            value={form.bedtimeTargetMax}
            onChange={(v) => setForm((f) => ({ ...f, bedtimeTargetMax: v }))}
          />
          <NumberField
            label="Glucosa muy alta (encima de)"
            value={form.highGlucoseThreshold}
            onChange={(v) => setForm((f) => ({ ...f, highGlucoseThreshold: v }))}
          />
        </Card>

        {/* Emergency protocol */}
        <Card className="p-4 space-y-2">
          <h2 className="font-semibold text-text-primary">Protocolo de emergencia</h2>
          <p className="text-xs text-text-secondary">
            Texto que aparece en los informes para la médica.
          </p>
          <textarea
            value={form.emergencyProtocolText}
            onChange={(e) => setForm((f) => ({ ...f, emergencyProtocolText: e.target.value }))}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-text-primary
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px] resize-none"
          />
        </Card>

        {/* Doctor notes */}
        <Card className="p-4 space-y-2">
          <h2 className="font-semibold text-text-primary">Notas para la médica</h2>
          <textarea
            value={form.doctorNotes}
            onChange={(e) => setForm((f) => ({ ...f, doctorNotes: e.target.value }))}
            placeholder="Indicaciones especiales, medicación actual..."
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-text-primary
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px] resize-none
              placeholder:text-text-secondary/50"
          />
        </Card>

        {/* PIN */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-text-primary">Seguridad</h2>
              <p className="text-xs text-text-secondary mt-0.5">PIN de acceso a la app</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/cambiar-pin')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10
                transition-colors text-sm text-text-secondary hover:text-text-primary"
            >
              <Shield size={15} />
              Cambiar PIN
            </button>
          </div>
        </Card>

        {saveError && <p className="text-sm text-red-400 text-center">{saveError}</p>}

        {saved && (
          <div className="flex items-center gap-2 justify-center text-green-400 text-sm">
            <Check size={16} />
            Configuración guardada
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={saving}>
          Guardar configuración
        </Button>
      </form>
    </div>
  );
}
