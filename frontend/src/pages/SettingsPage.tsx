import React, { useEffect, useState } from 'react';
import { Check, Shield, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { LoadingState, StateBlock } from '../components/ui/StateBlock';
import { useSettings } from '../hooks/useSettings';

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3">
      <span className="min-w-0 text-sm font-medium text-text-secondary">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="glass-input h-11 w-24 rounded-2xl border px-3 text-right text-base font-bold tabular-nums text-text-primary focus:outline-none focus:ring-2 focus:ring-medicalBlue/45"
        />
      </span>
    </label>
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
    const toastId = toast.loading('Guardando configuración...');
    try {
      await save({
        ...form,
        doctorNotes: form.doctorNotes || undefined,
      });
      toast.success('Configuración guardada', {
        id: toastId,
        description: 'Tus umbrales quedaron actualizados.',
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error('No se pudo guardar', {
        id: toastId,
        description: 'La configuración no se modificó. Intentá nuevamente.',
      });
    }
  };

  if (loading) return <LoadingState label="Cargando configuración" />;

  return (
    <div className="space-y-5">
      <PageHeader
        back
        icon={<SlidersHorizontal size={22} />}
        eyebrow="Ajustes clínicos"
        title="Configuración"
        description="Umbrales, seguridad y notas que ayudan a que GAGA responda con claridad."
      />

      <form onSubmit={handleSave} className="space-y-5">
        <Card className="space-y-3 p-5">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Umbrales de glucosa</h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Estos valores definen los estados visuales y el tono de atención de la app.
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-medicalBlue">
              Valores en mg/dL
            </p>
          </div>
          <NumberField
            label="Crítica debajo de"
            value={form.criticalGlucoseThreshold}
            onChange={(v) => setForm((f) => ({ ...f, criticalGlucoseThreshold: v }))}
          />
          <NumberField
            label="Baja debajo de"
            value={form.lowGlucoseThreshold}
            onChange={(v) => setForm((f) => ({ ...f, lowGlucoseThreshold: v }))}
          />
          <NumberField
            label="Objetivo mínimo"
            value={form.bedtimeTargetMin}
            onChange={(v) => setForm((f) => ({ ...f, bedtimeTargetMin: v }))}
          />
          <NumberField
            label="Objetivo máximo"
            value={form.bedtimeTargetMax}
            onChange={(v) => setForm((f) => ({ ...f, bedtimeTargetMax: v }))}
          />
          <NumberField
            label="Muy alta encima de"
            value={form.highGlucoseThreshold}
            onChange={(v) => setForm((f) => ({ ...f, highGlucoseThreshold: v }))}
          />
        </Card>

        <Card className="space-y-3 p-5">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Protocolo de emergencia</h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Texto incluido en informes médicos y situaciones prioritarias.
            </p>
          </div>
          <textarea
            value={form.emergencyProtocolText}
            onChange={(e) => setForm((f) => ({ ...f, emergencyProtocolText: e.target.value }))}
            className="glass-input min-h-[116px] w-full resize-none rounded-3xl border px-4 py-3 text-sm leading-6 text-text-primary focus:outline-none focus:ring-2 focus:ring-medicalBlue/45"
          />
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="text-lg font-bold text-text-primary">Notas para la médica</h2>
          <textarea
            value={form.doctorNotes}
            onChange={(e) => setForm((f) => ({ ...f, doctorNotes: e.target.value }))}
            placeholder="Indicaciones especiales, medicación actual..."
            className="glass-input min-h-[96px] w-full resize-none rounded-3xl border px-4 py-3 text-sm leading-6 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-medicalBlue/45"
          />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Seguridad</h2>
              <p className="mt-1 text-sm text-text-secondary">PIN privado de acceso a GAGA.</p>
            </div>
            <Button type="button" variant="secondary" onClick={() => navigate('/cambiar-pin')}>
              <Shield size={16} className="mr-2" />
              Cambiar PIN
            </Button>
          </div>
        </Card>

        {saveError && (
          <StateBlock
            tone="danger"
            title="No se pudo guardar"
            description={saveError}
            className="p-5"
          />
        )}

        {saved && (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-calmGreen/25 bg-calmGreen/10 px-4 py-3 text-sm font-semibold text-calmGreen">
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
