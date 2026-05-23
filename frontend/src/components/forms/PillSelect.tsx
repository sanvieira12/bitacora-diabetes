interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string | null;
  onChange: (v: string) => void;
}

export function PillSelect({ options, value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-150"
            style={{
              borderColor: active ? 'var(--gaga-accent)' : 'transparent',
              background: active ? 'rgba(245,158,66,0.15)' : 'var(--gaga-surface-2)',
              color: active ? 'var(--gaga-accent-soft)' : 'var(--gaga-text)',
              opacity: value !== null && !active ? 0.5 : 1,
              transform: active ? 'scale(1.05)' : 'scale(1)',
              boxShadow: active ? '0 0 0 1px var(--gaga-accent)' : 'none',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
