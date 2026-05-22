import { useState } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import type { AttentionLevel } from '../types';
import { formatAttentionLevel, getAttentionBgColor, getAttentionColor } from '../lib/formatters';

interface AttentionBadgeProps {
  level: AttentionLevel;
  reasons?: string[];
  size?: 'sm' | 'md' | 'lg';
}

const iconMap = {
  GREEN: CheckCircle,
  YELLOW: AlertTriangle,
  RED: AlertCircle,
};

const sizeMap = {
  sm: { pill: 'px-2 py-1 text-xs', icon: 12 },
  md: { pill: 'px-3 py-1.5 text-sm', icon: 14 },
  lg: { pill: 'px-4 py-2 text-base', icon: 18 },
};

export function AttentionBadge({ level, reasons, size = 'md' }: AttentionBadgeProps) {
  const [showReasons, setShowReasons] = useState(false);
  const Icon = iconMap[level];
  const colorClass = getAttentionColor(level);
  const bgClass = getAttentionBgColor(level);
  const s = sizeMap[size];

  return (
    <div className="relative inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={() => reasons && reasons.length > 0 && setShowReasons((v) => !v)}
        className={[
          'inline-flex items-center gap-1.5 rounded-full border font-medium',
          bgClass,
          colorClass,
          s.pill,
          reasons && reasons.length > 0 ? 'cursor-pointer' : 'cursor-default',
        ].join(' ')}
      >
        <Icon size={s.icon} />
        {formatAttentionLevel(level)}
      </button>
      {showReasons && reasons && reasons.length > 0 && (
        <div className="absolute top-full left-0 z-10 mt-1 w-64 bg-surface border border-border rounded-xl p-3 shadow-lg">
          <p className="text-xs font-semibold text-text-secondary mb-2">Motivos:</p>
          <ul className="space-y-1">
            {reasons.map((r, i) => (
              <li key={i} className={`text-xs ${colorClass}`}>
                • {r}
              </li>
            ))}
          </ul>
          <button
            className="mt-2 text-xs text-text-secondary hover:text-text-primary"
            onClick={() => setShowReasons(false)}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
