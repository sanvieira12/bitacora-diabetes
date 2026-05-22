import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { GlucoseInput } from '../components/forms/GlucoseInput';
import { createEpisode } from '../api/episodes';
import { today, nowTime } from '../lib/dateUtils';
import type { EpisodeSeverity } from '../types';

const COMMON_SYMPTOMS = [
  'Sudoración',
  'Temblores',
  'Mareos',
  'Confusión',
  'Hambre',
  'Palpitaciones',
  'Visión borrosa',
  'Debilidad',
];

const SEVERITY_OPTIONS: { value: EpisodeSeverity; label: string; color: string }[] = [
  { value: 'MILD', label: 'Leve', color: 'border-green-400 text-green-400 bg-green-400/10 hover:bg-green-400/20' },
  { value: 'MODERATE', label: 'Moderado', color: 'border-yellow-400 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' },
  { value: 'SEVERE', label: 'Grave', color: 'border-red-400 text-red-400 bg-red-400/10 hover:bg-red-400/20' },
];

export function RegisterEpisodePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nightRecordId = searchParams.get('nightRecordId') || undefined;
  const dateParam = searchParams.get('date') || today();

  const [date, setDate] = useState(dateParam);
  const [time, setTime] = useState(nowTime());
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [glucoseAtEpisode, setGlucoseAtEpisode] = useState('');
  const [intervention, setIntervention] = useState('');
  const [glucoseAfter, setGlucoseAfter] = useState('');
  const [recoveryTime, setRecoveryTime] = useState('');
  const [severity, setSeverity] = useState<EpisodeSeverity | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const addCustomSymptom = () => {
    const trimmed = customSymptom.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms((prev) => [...prev, trimmed]);
      setCustomSymptom('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!severity) {
      setError('Seleccioná la severidad del episodio');
      return;
    }
    if (!intervention.trim()) {
      setError('La intervención es obligatoria');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createEpisode({
        episodeDate: date,
        episodeTime: time,
        symptoms: selectedSymptoms,
        glucoseAtEpisode: glucoseAtEpisode ? Number(glucoseAtEpisode) : undefined,
        intervention: intervention.trim(),
        glucoseAfterIntervention: glucoseAfter ? Number(glucoseAfter) : undefined,
        recoveryTimeMinutes: recoveryTime ? Number(recoveryTime) : undefined,
        severity,
        notes: notes.trim() || undefined,
        nightRecordId,
      });
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  if (saved) {
    return (
      <div className="space-y-5">
        <Card className="p-6 text-center">
          <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
          <h2 className="text-lg font-bold text-text-primary mb-1">¡Episodio registrado!</h2>
          <p className="text-text-secondary text-sm mb-5">
            El episodio fue guardado correctamente.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/')} className="flex-1">
              Inicio
            </Button>
            <Button variant="primary" onClick={() => navigate('/historial')} className="flex-1">
              Ver historial
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-text-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Zap className="text-red-400" size={22} />
          <h1 className="text-xl font-bold text-text-primary">Registrar episodio</h1>
        </div>
      </div>

      {/* Optimized for 3AM - big, easy to tap */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* When */}
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold text-text-primary">¿Cuándo?</h2>
          <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Hora" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Card>

        {/* Severity - big buttons, most important */}
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold text-text-primary">Severidad *</h2>
          <div className="grid grid-cols-3 gap-3">
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSeverity(opt.value)}
                className={[
                  'py-4 rounded-xl border-2 font-bold text-base transition-all',
                  severity === opt.value
                    ? opt.color + ' scale-105'
                    : 'border-border text-text-secondary hover:border-white/30',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Glucose at episode */}
        <Card className="p-4">
          <GlucoseInput
            label="Glucosa en el episodio (opcional pero recomendado)"
            value={glucoseAtEpisode}
            onChange={setGlucoseAtEpisode}
          />
        </Card>

        {/* Symptoms chips */}
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold text-text-primary">Síntomas</h2>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
                className={[
                  'px-3 py-2 rounded-full border text-sm transition-all',
                  selectedSymptoms.includes(s)
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : 'border-border text-text-secondary hover:border-white/30',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Otro síntoma..."
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSymptom())}
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-text-primary
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-text-secondary/50"
            />
            <Button type="button" variant="secondary" size="sm" onClick={addCustomSymptom}>
              +
            </Button>
          </div>
        </Card>

        {/* Intervention - required */}
        <Card className="p-4 space-y-2">
          <h2 className="font-semibold text-text-primary">Intervención *</h2>
          <textarea
            required
            value={intervention}
            onChange={(e) => setIntervention(e.target.value)}
            placeholder="¿Qué tomaste? ¿Cuántos gramos? Ej: 15g de azúcar + 1 vaso de jugo..."
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
              placeholder:text-text-secondary/50 min-h-[80px] resize-none text-sm"
          />
        </Card>

        {/* Post-intervention glucose */}
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold text-text-primary">Después de la intervención</h2>
          <GlucoseInput
            label="Glucosa post-intervención (opcional)"
            value={glucoseAfter}
            onChange={setGlucoseAfter}
          />
          <Input
            label="Tiempo de recuperación (minutos)"
            type="number"
            min={0}
            value={recoveryTime}
            onChange={(e) => setRecoveryTime(e.target.value)}
            placeholder="15"
          />
        </Card>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-secondary">Notas (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones adicionales..."
            className="bg-background border border-border rounded-xl px-4 py-3 text-text-primary
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-text-secondary/50
              min-h-[60px] resize-none text-sm"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting}>
          <Zap size={20} className="mr-2" />
          Registrar episodio
        </Button>
      </form>
    </div>
  );
}
