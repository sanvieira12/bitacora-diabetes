import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Lock, Moon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Card } from '../components/ui/Card';
import { NightBackground } from '../components/visual/NightBackground';
import { AnimatedPage } from '../components/visual/AnimatedPage';
import { useLateNightMode } from '../hooks/useLateNightMode';
import { cn } from '../lib/cn';

const PIN_LENGTH = 4;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const lateNight = useLateNightMode();
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

      if (digit && index < PIN_LENGTH - 1) inputRefs.current[index + 1]?.focus();
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
    <div className={cn('relative min-h-screen overflow-hidden bg-background px-5 font-sans text-text-primary', lateNight && 'late-night-mode')}>
      <NightBackground lateNight={lateNight} />
      <AnimatedPage className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center pb-[calc(2rem+var(--gaga-safe-bottom))] pt-[calc(2rem+var(--gaga-safe-top))]">
        <div className="mb-8 text-center">
          <motion.div
            className="mx-auto grid h-20 w-20 place-items-center rounded-[2rem] border border-white/10 bg-white/10 shadow-glowBlue backdrop-blur-2xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: lateNight ? 8 : 5.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Moon className="text-medicalBlue" size={38} />
          </motion.div>
          <h1 className="medical-text-gradient mt-5 text-4xl font-extrabold tracking-tight">GAGA</h1>
        </div>

        <Card className="p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-calmGreen/10 text-calmGreen">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Ingresá el PIN</h2>
            </div>
          </div>

          <motion.div
            className="flex justify-center gap-3"
            animate={shake ? { x: [-8, 8, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.38 }}
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
                aria-label={`Dígito ${i + 1} del PIN`}
                className={cn(
                  'h-16 w-14 rounded-2xl border-2 bg-white/10 text-center text-2xl font-extrabold text-text-primary outline-none backdrop-blur-xl transition-all',
                  'focus:border-medicalBlue focus:ring-4 focus:ring-medicalBlue/15',
                  digit ? 'border-medicalBlue/80 shadow-glowBlue' : 'border-white/10',
                  locked && 'cursor-not-allowed opacity-50',
                  error && 'border-severeRed/80'
                )}
              />
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {locked ? (
              <motion.div
                key="locked"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-5 flex items-start gap-2 rounded-2xl border border-severeRed/25 bg-severeRed/10 p-3"
              >
                <Lock size={16} className="mt-0.5 shrink-0 text-severeRed" />
                <p className="text-sm leading-5 text-red-200">
                  Acceso bloqueado por seguridad. Volvé a intentar en{' '}
                  <strong>{minutesLeft} minuto{minutesLeft !== 1 ? 's' : ''}</strong>.
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-5 flex items-start gap-2 rounded-2xl border border-severeRed/25 bg-severeRed/10 p-3"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-severeRed" />
                <p className="text-sm leading-5 text-red-200">{error}</p>
              </motion.div>
            ) : loading ? (
              <motion.p
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-5 text-center text-sm text-text-secondary"
              >
                Verificando acceso...
              </motion.p>
            ) : null}
          </AnimatePresence>
        </Card>
      </AnimatedPage>
    </div>
  );
}
