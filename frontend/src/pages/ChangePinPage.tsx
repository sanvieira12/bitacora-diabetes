import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

const PIN_LENGTH = 4;

function PinRow({
  label,
  digits,
  onChange,
  onKeyDown,
  inputRefs,
  hasError,
  disabled,
}: {
  label: string;
  digits: string[];
  onChange: (i: number, v: string) => void;
  onKeyDown: (i: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRefs: React.MutableRefObject<Array<HTMLInputElement | null>>;
  hasError: boolean;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-text-secondary">{label}</p>
      <div className="flex gap-3">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            autoComplete="off"
            disabled={disabled}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className={[
              'w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-surface',
              'text-text-primary transition-all outline-none',
              'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
              digit ? 'border-blue-400' : 'border-border',
              hasError ? 'border-red-400' : '',
              disabled ? 'opacity-50' : '',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  );
}

function usePinInput() {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = useCallback(
    (i: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1);
      setDigits((prev) => {
        const next = [...prev];
        next[i] = digit;
        return next;
      });
      if (digit && i < PIN_LENGTH - 1) refs.current[i + 1]?.focus();
    },
    []
  );

  const handleKeyDown = useCallback((i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      setDigits((prev) => {
        if (prev[i]) {
          const next = [...prev];
          next[i] = '';
          return next;
        }
        if (i > 0) refs.current[i - 1]?.focus();
        return prev;
      });
    }
  }, []);

  const reset = useCallback(() => setDigits(Array(PIN_LENGTH).fill('')), []);

  return { digits, refs, handleChange, handleKeyDown, reset, pin: digits.join('') };
}

export function ChangePinPage() {
  const { changePin, mustChangePin } = useAuth();
  const navigate = useNavigate();
  const current = usePinInput();
  const next = usePinInput();
  const confirm = usePinInput();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    current.refs.current[0]?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (next.pin.length !== PIN_LENGTH || !/^\d{4}$/.test(next.pin)) {
      setError('El nuevo PIN debe tener exactamente 4 dígitos numéricos.');
      return;
    }
    if (next.pin !== confirm.pin) {
      setError('Los PINs nuevos no coinciden.');
      confirm.reset();
      confirm.refs.current[0]?.focus();
      return;
    }

    setLoading(true);
    try {
      await changePin(current.pin, next.pin);
      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el PIN.');
      current.reset();
      current.refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="text-green-400" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Cambiar PIN</h1>
          {mustChangePin && (
            <p className="text-sm text-yellow-400">
              Necesitás cambiar el PIN predeterminado antes de continuar.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PinRow
            label="PIN actual"
            digits={current.digits}
            onChange={current.handleChange}
            onKeyDown={current.handleKeyDown}
            inputRefs={current.refs}
            hasError={!!error}
            disabled={loading || success}
          />
          <PinRow
            label="PIN nuevo"
            digits={next.digits}
            onChange={next.handleChange}
            onKeyDown={next.handleKeyDown}
            inputRefs={next.refs}
            hasError={!!error && next.pin !== confirm.pin}
            disabled={loading || success}
          />
          <PinRow
            label="Repetir PIN nuevo"
            digits={confirm.digits}
            onChange={confirm.handleChange}
            onKeyDown={confirm.handleKeyDown}
            inputRefs={confirm.refs}
            hasError={!!error && next.pin !== confirm.pin}
            disabled={loading || success}
          />

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 justify-center text-green-400">
              <Check size={18} />
              <span className="text-sm font-medium">PIN cambiado. Redirigiendo…</span>
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              success ||
              current.pin.length !== PIN_LENGTH ||
              next.pin.length !== PIN_LENGTH ||
              confirm.pin.length !== PIN_LENGTH
            }
            className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-500 disabled:opacity-40
              disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-colors"
          >
            {loading ? 'Cambiando…' : 'Cambiar PIN'}
          </button>

          {!mustChangePin && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors py-2"
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      <p className="absolute bottom-6 text-xs text-text-secondary/50 text-center px-8">
        Esta herramienta es para uso personal y no reemplaza el criterio médico.
      </p>
    </div>
  );
}
