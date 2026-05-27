import { useRef, useState } from 'react';

export interface SnappedOption {
  value: string;
  label: string;
  color: string; // CSS color string
}

interface Props {
  options: SnappedOption[];
  value: string | null;
  onChange: (v: string) => void;
}

export function SnappedSlider({ options, value, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const activeIndex = value ? options.findIndex((o) => o.value === value) : -1;
  const activeColor = activeIndex >= 0 ? options[activeIndex].color : 'var(--gaga-text-dim)';
  const thumbPct = activeIndex < 0 ? 0 : (activeIndex / (options.length - 1)) * 100;

  const snapFromX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const idx = Math.round(pct * (options.length - 1));
    onChange(options[idx].value);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Labels row */}
      <div
        className="flex justify-between"
        style={{ gap: 0 }}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="flex min-h-[54px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-2 transition-all duration-200 active:scale-[0.98]"
            style={{
              opacity: value === null || value === opt.value ? 1 : 0.72,
              boxShadow: value === opt.value ? `0 0 28px ${opt.color}33` : 'none',
            }}
          >
            <span
              className="text-xs font-medium text-center leading-tight"
              style={{ color: value === opt.value ? opt.color : 'var(--gaga-text-dim)' }}
            >
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      {/* Track + thumb */}
      <div
        ref={trackRef}
        className="relative h-10 flex items-center cursor-pointer"
        onMouseDown={(e) => {
          setDragging(true);
          snapFromX(e.clientX);
        }}
        onMouseMove={(e) => dragging && snapFromX(e.clientX)}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onTouchStart={(e) => {
          setDragging(true);
          snapFromX(e.touches[0].clientX);
        }}
        onTouchMove={(e) => dragging && snapFromX(e.touches[0].clientX)}
        onTouchEnd={() => setDragging(false)}
      >
        {/* Base track */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full"
          style={{ background: 'var(--gaga-surface-2)' }}
        />
        {/* Filled track */}
        {activeIndex >= 0 && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded-full"
            style={{
              width: `${thumbPct}%`,
              background: activeColor,
              opacity: 0.6,
              transition: 'width 200ms var(--ease-drawer)',
            }}
          />
        )}
        {/* Tick marks */}
        {options.map((_, i) => {
          const pct = (i / (options.length - 1)) * 100;
          return (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{
                left: `calc(${pct}% - 4px)`,
                background: i <= activeIndex ? activeColor : 'var(--gaga-surface-2)',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'background 200ms ease-out',
              }}
            />
          );
        })}
        {/* Thumb */}
        {activeIndex >= 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full pointer-events-none"
            style={{
              left: `calc(${thumbPct}% - 14px)`,
              background: activeColor,
              border: '3px solid #0a0a12',
              boxShadow: `0 0 0 2px ${activeColor}, 0 4px 12px rgba(0,0,0,0.4)`,
              transition: 'left 200ms var(--ease-drawer), background 200ms ease-out',
              transform: `translateY(-50%) scale(${dragging ? 1.15 : 1})`,
            }}
          />
        )}
      </div>
    </div>
  );
}
