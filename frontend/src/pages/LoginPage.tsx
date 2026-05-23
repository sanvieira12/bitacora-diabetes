import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

const PIN_LENGTH = 4;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown for lockout display
  const [minutesLeft, setMinutesLeft] = useState(0);
  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const diff = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
      setMinutesLeft(Math.max(diff, 0));
      if (diff <= 0) {
        setLocked(false);
        setLockedUntil(null);
        setError('');
      }
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
    setDigits(Array(PIN_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  }, []);

  const submitPin = useCallback(
    async (pin: string) => {
      setLoading(true);
      try {
        await login(pin);
        navigate('/', { replace: true });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes('locked') || msg.toLowerCase().includes('bloqueado')) {
          setLocked(true);
          setLockedUntil(new Date(Date.now() + 15 * 60 * 1000));
          setError('');
        } else {
          setError(msg);
        }
        triggerShake();
      } finally {
        setLoading(false);
      }
    },
    [login, navigate, triggerShake]
  );

  const handleChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1);
      const next = [...digits];
      next[index] = digit;
      setDigits(next);
      setError('');

      if (digit && index < PIN_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      if (digit && index === PIN_LENGTH - 1) {
        const pin = next.join('');
        if (pin.length === PIN_LENGTH) submitPin(pin);
      }
    },
    [digits, submitPin]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (digits[index]) {
          const next = [...digits];
          next[index] = '';
          setDigits(next);
        } else if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      }
    },
    [digits]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
      if (pasted.length === PIN_LENGTH) {
        setDigits(pasted.split(''));
        inputRefs.current[PIN_LENGTH - 1]?.focus();
        submitPin(pasted);
      }
    },
    [submitPin]
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Moon className="text-blue-400" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">GAGA</h1>
          <p className="text-sm text-text-secondary">Ingresá tu PIN para continuar</p>
        </div>

        {/* PIN inputs */}
        <div
          className={`flex justify-center gap-3 ${shake ? 'animate-shake' : ''}`}
          onPaste={handlePaste}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              disabled={locked || loading}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={[
                'w-14 h-16 text-center text-2xl font-bold rounded-2xl border-2 bg-surface',
                'text-text-primary transition-all outline-none',
                'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                digit ? 'border-blue-400' : 'border-border',
                locked ? 'opacity-50 cursor-not-allowed' : '',
                error ? 'border-red-400' : '',
              ].join(' ')}
            />
          ))}
        </div>

        {/* Error / locked message */}
        {locked ? (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <Lock size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">
              Acceso bloqueado por seguridad. Volvé a intentar en{' '}
              <strong>{minutesLeft} minuto{minutesLeft !== 1 ? 's' : ''}</strong>.
            </p>
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        ) : null}

        {loading && (
          <p className="text-center text-sm text-text-secondary animate-pulse">Verificando…</p>
        )}
      </div>

      {/* Footer disclaimer */}
      <p className="absolute bottom-6 text-xs text-text-secondary/50 text-center px-8">
        Esta herramienta es para uso personal y no reemplaza el criterio médico.
      </p>
    </div>
  );
}
