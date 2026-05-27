import { Activity, AlertCircle, CheckCircle2, MinusCircle } from 'lucide-react';
import { cn } from '../../lib/cn';
import { medicalTone, type MedicalVisualStatus } from '../../lib/medicalVisualState';

const copy: Record<MedicalVisualStatus, string> = {
  stable: 'Estable',
  attention: 'Atención',
  severe: 'Prioritario',
  unknown: 'Sin dato',
};

const icons = {
  stable: CheckCircle2,
  attention: Activity,
  severe: AlertCircle,
  unknown: MinusCircle,
};

export function MedicalStatusBadge({ status, className }: { status: MedicalVisualStatus; className?: string }) {
  const Icon = icons[status];
  const tone = medicalTone[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
        tone.bg,
        tone.border,
        tone.text,
        className
      )}
    >
      <Icon size={13} />
      {copy[status]}
    </span>
  );
}
