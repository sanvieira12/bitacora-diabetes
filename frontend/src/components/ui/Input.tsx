import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Input({ label, error, helper, id, className = '', ...rest }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'glass-input border rounded-2xl px-4 py-3 text-text-primary',
          'focus:outline-none focus:ring-2 focus:ring-medicalBlue/40 focus:border-medicalBlue/70',
          'placeholder:text-text-secondary/50 transition-colors',
          error ? 'border-red-400' : 'border-border',
          className,
        ].join(' ')}
        {...rest}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {helper && !error && <p className="text-xs text-text-secondary">{helper}</p>}
    </div>
  );
}
