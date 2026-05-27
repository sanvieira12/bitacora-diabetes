import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/cn';

const stars = [
  ['8%', '14%', '0.35'], ['18%', '28%', '0.48'], ['29%', '9%', '0.32'], ['39%', '21%', '0.54'],
  ['51%', '13%', '0.36'], ['62%', '30%', '0.42'], ['73%', '12%', '0.55'], ['84%', '24%', '0.38'],
  ['92%', '8%', '0.5'], ['12%', '56%', '0.3'], ['25%', '68%', '0.44'], ['43%', '54%', '0.34'],
  ['57%', '70%', '0.5'], ['77%', '62%', '0.36'], ['89%', '72%', '0.45'], ['6%', '82%', '0.28'],
  ['34%', '88%', '0.36'], ['67%', '86%', '0.32'],
];

interface NightBackgroundProps {
  lateNight?: boolean;
}

export function NightBackground({ lateNight = false }: NightBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const [isNightWindow, setIsNightWindow] = useState(() => {
    const hour = new Date().getHours();
    return hour >= 22 || hour < 10;
  });
  const duration = lateNight ? 34 : 24;

  useEffect(() => {
    const updateByHour = () => {
      const hour = new Date().getHours();
      setIsNightWindow(hour >= 22 || hour < 10);
    };
    const id = window.setInterval(updateByHour, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 z-0 overflow-hidden bg-night-950',
        lateNight && 'opacity-90'
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,179,255,0.22),transparent_36%),linear-gradient(180deg,#050816_0%,#081024_52%,#040711_100%)]" />
      <motion.div
        className="absolute -left-1/4 top-[-18%] h-[48rem] w-[48rem] rounded-full bg-[radial-gradient(circle,rgba(99,179,255,0.22),rgba(99,179,255,0.06)_38%,transparent_66%)] blur-3xl"
        animate={reducedMotion ? undefined : { x: [0, 38, -18, 0], y: [0, 28, 12, 0], scale: [1, 1.08, 0.98, 1] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-1/3 top-[22%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(110,231,183,0.15),rgba(99,179,255,0.07)_40%,transparent_68%)] blur-3xl"
        animate={reducedMotion ? undefined : { x: [0, -34, 18, 0], y: [0, -20, 22, 0], scale: [1, 0.96, 1.08, 1] }}
        transition={{ duration: duration + 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-28%] left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.08),rgba(99,179,255,0.06)_38%,transparent_70%)] blur-3xl"
        animate={reducedMotion ? undefined : { opacity: [0.42, 0.7, 0.46], scale: [1, 1.05, 1] }}
        transition={{ duration: duration + 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      {isNightWindow && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:80px_80px] opacity-25" />
          <div className="absolute inset-0 opacity-90">
            {stars.map(([left, top, opacity], index) => (
              <motion.span
                key={`${left}-${top}`}
                className="absolute h-[2px] w-[2px] rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.85)]"
                style={{ left, top, opacity: Number(opacity) }}
                animate={reducedMotion ? undefined : { opacity: [Number(opacity), Number(opacity) + 0.28, Number(opacity)] }}
                transition={{ duration: lateNight ? 8 + index * 0.3 : 5 + index * 0.24, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-night-950/10 to-night-950/74" />
    </div>
  );
}
