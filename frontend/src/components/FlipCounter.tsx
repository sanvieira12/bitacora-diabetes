import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
}

function Digit({ to, animate }: { from: string; to: string; animate: boolean }) {
  return (
    <span
      className="inline-block tabular-nums"
      style={
        animate
          ? {
              animation: 'flipUp 600ms cubic-bezier(0.23,1,0.32,1) forwards',
            }
          : undefined
      }
    >
      {to}
    </span>
  );
}

export function FlipCounter({ value }: Props) {
  const prev = useRef(value);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setAnimKey((k) => k + 1);
    }
  }, [value]);

  const digits = String(value).split('');

  return (
    <span className="font-bold text-4xl" style={{ color: 'var(--gaga-accent)' }}>
      {digits.map((d, i) => (
        <Digit key={`${animKey}-${i}`} from={d} to={d} animate={animKey > 0} />
      ))}
    </span>
  );
}
