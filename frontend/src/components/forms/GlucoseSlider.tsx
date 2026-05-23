import { useCallback, useId } from 'react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

function glucoseColor(v: number): string {
  if (v < 70)  return '#f97316'; // danger low
  if (v <= 100) return '#4ade80'; // perfect
  if (v <= 180) return '#fbbf24'; // ok
  return '#f87171';               // high
}

function glucoseLabel(v: number): string {
  if (v < 70)  return 'Bajo';
  if (v <= 100) return 'Perfecto';
  if (v <= 180) return 'Ok';
  return 'Alto';
}

export function GlucoseSlider({ value, onChange, min = 10, max = 500 }: Props) {
  const id = useId();
  const color = glucoseColor(value);
  const pct = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value)),
    [onChange],
  );

  return (
    <div className="space-y-3">
      {/* Value display */}
      <div className="flex flex-col items-center gap-1">
        <span
          className="text-5xl font-bold tabular-nums transition-colors duration-300"
          style={{ color }}
        >
          {value}
        </span>
        <span className="text-sm font-medium" style={{ color }}>
          mg/dL · {glucoseLabel(value)}
        </span>
      </div>

      {/* Slider track */}
      <div className="relative h-10 flex items-center px-2">
        {/* Filled track */}
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 h-2 rounded-full pointer-events-none transition-all duration-300"
          style={{ width: `calc(${pct}% - 0px)`, background: color, opacity: 0.7 }}
        />
        {/* Base track */}
        <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-2 rounded-full bg-white/10 -z-10" />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={handleChange}
          className="glucose-slider w-full appearance-none bg-transparent cursor-pointer"
          style={
            {
              '--thumb-color': color,
            } as React.CSSProperties
          }
        />
      </div>

      {/* Range labels */}
      <div className="flex justify-between text-xs text-text-secondary px-2">
        <span>{min}</span>
        <span>{max}</span>
      </div>

      <style>{`
        .glucose-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--thumb-color);
          border: 3px solid #0a0a12;
          box-shadow: 0 0 0 2px var(--thumb-color), 0 4px 12px rgba(0,0,0,0.4);
          transition: transform 150ms ease-out, box-shadow 150ms ease-out;
          cursor: grab;
        }
        .glucose-slider::-webkit-slider-thumb:active {
          transform: scale(1.15);
          cursor: grabbing;
        }
        .glucose-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--thumb-color);
          border: 3px solid #0a0a12;
          box-shadow: 0 0 0 2px var(--thumb-color), 0 4px 12px rgba(0,0,0,0.4);
          transition: transform 150ms ease-out;
          cursor: grab;
        }
        .glucose-slider::-moz-range-thumb:active {
          transform: scale(1.15);
        }
        .glucose-slider::-webkit-slider-runnable-track {
          background: transparent;
        }
        .glucose-slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
