import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';

interface PageHeaderProps {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  back?: boolean;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ icon, eyebrow, title, description, back, action, className }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className={cn('flex items-start gap-3', className)}>
      {back && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-text-secondary transition hover:bg-white/15 hover:text-text-primary active:scale-95"
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      {icon && (
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-medicalBlue shadow-glowBlue">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-text-primary">
          {title}
        </h1>
        {description && <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
