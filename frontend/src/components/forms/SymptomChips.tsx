interface Symptom {
  value: string;
  label: string;
}

const SYMPTOMS: Symptom[] = [
  { value: 'sweating',     label: 'Transpiración' },
  { value: 'trembling',    label: 'Temblores' },
  { value: 'palpitations', label: 'Palpitaciones' },
  { value: 'confusion',    label: 'Confusión' },
  { value: 'headache',     label: 'Dolor de cabeza' },
  { value: 'weakness',     label: 'Debilidad general' },
  { value: 'hunger',       label: 'Hambre súbita' },
  { value: 'nauseas',      label: 'Náuseas' },
  { value: 'vision',       label: 'Vista borrosa' },
  { value: 'no_symptoms',  label: 'Sin síntomas claros' },
];

interface Props {
  selected: string[];
  onChange: (next: string[]) => void;
}

export function SymptomChips({ selected, onChange }: Props) {
  const toggle = (val: string) => {
    if (val === 'no_symptoms') {
      onChange(selected.includes('no_symptoms') ? [] : ['no_symptoms']);
      return;
    }
    const without = selected.filter((s) => s !== 'no_symptoms');
    if (without.includes(val)) {
      onChange(without.filter((s) => s !== val));
    } else {
      onChange([...without, val]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {SYMPTOMS.map((s) => {
        const active = selected.includes(s.value);
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => toggle(s.value)}
            className="min-h-[44px] rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
            style={{
              borderColor: active ? 'rgba(99,179,255,0.46)' : 'rgba(255,255,255,0.1)',
              background: active ? 'rgba(99,179,255,0.15)' : 'rgba(255,255,255,0.08)',
              color: active ? 'var(--gaga-accent-soft)' : 'var(--gaga-text)',
              opacity: selected.length > 0 && !active ? 0.72 : 1,
              boxShadow: active ? '0 0 28px rgba(99,179,255,0.16), inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
