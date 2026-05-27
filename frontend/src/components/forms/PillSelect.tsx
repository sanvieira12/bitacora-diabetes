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
            className="min-h-[44px] rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
            style={{
              borderColor: active ? 'rgba(99,179,255,0.46)' : 'rgba(255,255,255,0.1)',
              background: active ? 'rgba(99,179,255,0.15)' : 'rgba(255,255,255,0.08)',
              color: active ? 'var(--gaga-accent-soft)' : 'var(--gaga-text)',
              opacity: value !== null && !active ? 0.72 : 1,
              boxShadow: active ? '0 0 28px rgba(99,179,255,0.16), inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
