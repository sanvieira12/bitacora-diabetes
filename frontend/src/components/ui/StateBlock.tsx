import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Button } from './Button';
import { cn } from '../../lib/cn';

interface StateBlockProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'danger';
  className?: string;
}

export function StateBlock({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  tone = 'neutral',
  className,
}: StateBlockProps) {
  return (
    <Card className={cn('p-6 text-center', tone === 'danger' && 'border-severeRed/25', className)}>
      <div
        className={cn(
          'mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border bg-white/10',
          tone === 'danger' ? 'border-severeRed/30 text-severeRed shadow-glowRed' : 'border-white/10 text-medicalBlue shadow-glowBlue'
        )}
      >
        {icon ?? (tone === 'danger' ? <AlertCircle size={22} /> : <RefreshCw size={22} />)}
      </div>
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">{description}</p>}
      {actionLabel && onAction && (
        <Button type="button" variant={tone === 'danger' ? 'danger' : 'secondary'} className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}

export function LoadingState({ label = 'Sincronizando datos' }: { label?: string }) {
  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 shrink-0">
          <motion.div
            className="absolute inset-0 rounded-full border border-medicalBlue/30 bg-medicalBlue/10"
            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-3 rounded-full bg-medicalBlue shadow-glowBlue" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">{label}</p>
          <div className="mt-3 space-y-2">
            <div className="h-2.5 w-5/6 rounded-full bg-white/10" />
            <div className="h-2.5 w-2/3 rounded-full bg-white/7" />
          </div>
        </div>
      </div>
    </Card>
  );
}
