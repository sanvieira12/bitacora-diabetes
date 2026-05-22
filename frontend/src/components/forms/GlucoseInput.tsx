
interface GlucoseInputProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  id?: string;
}

export function GlucoseInput({
  label,
  value,
  onChange,
  error,
  required,
  placeholder = '120',
  id,
}: GlucoseInputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-') || 'glucose-input';
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={20}
          max={600}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={[
            'w-full bg-background border rounded-xl pl-4 pr-20 py-4',
            'text-2xl font-bold text-text-primary text-center',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
            'placeholder:text-text-secondary/30 transition-colors',
            error ? 'border-red-400' : 'border-border',
          ].join(' ')}
        />
        <span className="absolute right-4 text-sm font-medium text-text-secondary pointer-events-none">
          mg/dL
        </span>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
