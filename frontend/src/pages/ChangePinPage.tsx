import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AnimatedPage } from '../components/visual/AnimatedPage';
import { NightBackground } from '../components/visual/NightBackground';
import { useLateNightMode } from '../hooks/useLateNightMode';
import { cn } from '../lib/cn';

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
      <p className="text-sm font-medium text-text-secondary">{label}</p>
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
            aria-label={`${label}, dígito ${i + 1}`}
            className={cn(
              'h-14 w-12 rounded-2xl border-2 bg-white/10 text-center text-xl font-bold text-text-primary outline-none backdrop-blur-xl transition-all',
              'focus:border-medicalBlue focus:ring-2 focus:ring-medicalBlue/20',
              digit ? 'border-medicalBlue' : 'border-white/10',
              hasError && 'border-severeRed',
              disabled && 'opacity-50'
            )}
          />
        ))}
      </div>
    </div>
  );
}

function usePinInput() {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = useCallback((i: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
    if (digit && i < PIN_LENGTH - 1) refs.current[i + 1]?.focus();
  }, []);

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
  const lateNight = useLateNightMode();
  const current = usePinInput();
  const next = usePinInput();
  const confirm = usePinInput();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    current.refs.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className={cn('relative min-h-screen overflow-hidden bg-background px-6 text-text-primary', lateNight && 'late-night-mode')}>
      <NightBackground lateNight={lateNight} />
      <AnimatedPage className="mx-auto flex min-h-screen w-full max-w-xs flex-col justify-center py-[calc(2rem+var(--gaga-safe-top))]">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-white/10 bg-calmGreen/10 shadow-[0_0_42px_rgba(110,231,183,0.18)]">
            <ShieldCheck className="text-calmGreen" size={32} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-text-primary">Cambiar PIN</h1>
          {mustChangePin && (
            <p className="mt-2 text-sm leading-6 text-alertAmber">
              Necesitás cambiar el PIN predeterminado antes de continuar.
            </p>
          )}
        </div>

        <Card className="mt-8 p-5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <PinRow label="PIN actual" digits={current.digits} onChange={current.handleChange} onKeyDown={current.handleKeyDown} inputRefs={current.refs} hasError={!!error} disabled={loading || success} />
            <PinRow label="PIN nuevo" digits={next.digits} onChange={next.handleChange} onKeyDown={next.handleKeyDown} inputRefs={next.refs} hasError={!!error && next.pin !== confirm.pin} disabled={loading || success} />
            <PinRow label="Repetir PIN nuevo" digits={confirm.digits} onChange={confirm.handleChange} onKeyDown={confirm.handleKeyDown} inputRefs={confirm.refs} hasError={!!error && next.pin !== confirm.pin} disabled={loading || success} />

            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-severeRed/25 bg-severeRed/10 p-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-severeRed" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center justify-center gap-2 text-calmGreen">
                <Check size={18} />
                <span className="text-sm font-medium">PIN cambiado. Redirigiendo...</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={
                loading ||
                success ||
                current.pin.length !== PIN_LENGTH ||
                next.pin.length !== PIN_LENGTH ||
                confirm.pin.length !== PIN_LENGTH
              }
            >
              {loading ? 'Cambiando...' : 'Cambiar PIN'}
            </Button>

            {!mustChangePin && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                Cancelar
              </button>
            )}
          </form>
        </Card>

        <p className="mt-8 text-center text-xs leading-5 text-text-secondary/60">
          Esta herramienta es para uso personal y no reemplaza el criterio médico.
        </p>
      </AnimatedPage>
    </div>
  );
}
