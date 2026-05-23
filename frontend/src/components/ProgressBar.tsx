import { useEffect, useRef, useState } from 'react';
import type { ProgressData } from '../types';

interface Props {
  progress: ProgressData;
  animateFrom?: number; // previous percentComplete to animate from
}

export function ProgressBar({ progress, animateFrom }: Props) {
  const { totalNights, nightsToGo, goalLabel, percentComplete } = progress;
  const near = nightsToGo <= 10;

  const [displayPct, setDisplayPct] = useState(animateFrom ?? percentComplete);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = animateFrom ?? percentComplete;
    const to = percentComplete;
    if (Math.abs(from - to) < 0.5) {
      setDisplayPct(to);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    const ease = (t: number) =>
      t < 1 ? 1 - Math.pow(1 - t, 3) : 1; // cubic ease-out

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      setDisplayPct(from + (to - from) * ease(t));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [percentComplete, animateFrom]);

  return (
    <div className="w-full space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between text-xs text-text-secondary px-0.5">
        <span className="font-medium" style={{ color: 'var(--gaga-accent-soft)' }}>
          {totalNights} {totalNights === 1 ? 'noche' : 'noches'}
        </span>
        <span>
          {nightsToGo > 0
            ? `Faltan ${nightsToGo} para ${goalLabel}`
            : `¡${goalLabel} completada! 🎉`}
        </span>
      </div>

      {/* Track */}
      <div
        className="relative h-4 rounded-full overflow-hidden"
        style={{
          background: 'var(--gaga-surface-2)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
        }}
      >
        {/* Moon icon at start */}
        <span
          className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] leading-none z-10 select-none"
          style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}
        >
          🌙
        </span>

        {/* Animated fill using scaleX */}
        <div
          className="absolute inset-0 rounded-full origin-left"
          style={{
            transform: `scaleX(${displayPct / 100})`,
            transformOrigin: 'left center',
            background:
              'linear-gradient(90deg, #f59e42, #fb923c, #f472b6, #f59e42)',
            backgroundSize: '200% 100%',
            animation: 'progressFlow 3s ease infinite',
            transition: 'none',
          }}
        />

        {/* Star icon at end */}
        <span
          className={`absolute right-1 top-1/2 -translate-y-1/2 text-[10px] leading-none z-10 select-none
            ${near ? 'animate-starPulse' : ''}`}
          style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}
        >
          ✨
        </span>
      </div>
    </div>
  );
}
