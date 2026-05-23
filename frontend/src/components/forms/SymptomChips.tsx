interface Symptom {
  value: string;
  label: string;
}

const SYMPTOMS: Symptom[] = [
  { value: 'sweating',     label: '💧 Transpiración' },
  { value: 'trembling',    label: '🫨 Temblores' },
  { value: 'palpitations', label: '💓 Palpitaciones' },
  { value: 'confusion',    label: '😵‍💫 Confusión' },
  { value: 'headache',     label: '🤕 Dolor de cabeza' },
  { value: 'weakness',     label: '🫠 Debilidad general' },
  { value: 'hunger',       label: '🍬 Hambre súbita' },
  { value: 'nausea',       label: '🤢 Náuseas' },
  { value: 'vision',       label: '👁️ Vista borrosa' },
  { value: 'no_symptoms',  label: '🤷 Sin síntomas claros' },
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
            className="px-3 py-2 rounded-full text-sm font-medium border-2 transition-all duration-150"
            style={{
              borderColor: active ? 'var(--gaga-accent)' : 'transparent',
              background: active ? 'rgba(245,158,66,0.15)' : 'var(--gaga-surface-2)',
              color: active ? 'var(--gaga-accent-soft)' : 'var(--gaga-text)',
              opacity: selected.length > 0 && !active ? 0.4 : 1,
              transform: active ? 'scale(1.03)' : 'scale(1)',
              boxShadow: active ? '0 0 0 1px var(--gaga-accent)' : 'none',
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
