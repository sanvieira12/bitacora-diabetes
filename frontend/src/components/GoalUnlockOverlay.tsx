import { useEffect, useRef } from 'react';

interface Props {
  goalLabel: string;
  onDismiss: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

const COLORS = ['#f59e42', '#fb923c', '#f472b6', '#4ade80', '#fbbf7a', '#fff'];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function GoalUnlockOverlay({ goalLabel, onDismiss }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = Array.from({ length: 80 }).map(() => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: randomBetween(-8, 8),
      vy: randomBetween(-14, -2),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(4, 10),
      alpha: 1,
    }));

    const start = performance.now();
    const duration = 2500;

    const draw = (now: number) => {
      const elapsed = now - start;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // gravity
        p.alpha = Math.max(0, 1 - elapsed / duration);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      });
      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.7)', animation: 'fadeIn 200ms ease-out' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm rounded-3xl p-8 text-center space-y-5"
        style={{
          background: 'var(--gaga-surface)',
          border: '1px solid rgba(245,158,66,0.3)',
          boxShadow: '0 0 40px rgba(245,158,66,0.2)',
          animation: 'celebrationIn 300ms ease-out forwards',
        }}
      >
        <div className="text-6xl">🏆</div>
        <div className="space-y-1">
          <p className="text-sm font-medium" style={{ color: 'var(--gaga-accent)' }}>
            ¡Meta desbloqueada!
          </p>
          <h2 className="text-2xl font-bold text-text-primary">{goalLabel}</h2>
        </div>
        <p className="text-sm text-text-secondary">
          Seguís sumando noches. Cada registro cuenta. 💪
        </p>
        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
          style={{ background: 'var(--gaga-accent)', color: '#0a0a12' }}
        >
          ¡Genial!
        </button>
      </div>
    </div>
  );
}
