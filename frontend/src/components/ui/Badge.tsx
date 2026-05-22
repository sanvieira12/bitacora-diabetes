import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  className?: string;
}

const colorMap: Record<string, string> = {
  green: 'bg-green-400/20 text-green-400 border-green-400/40',
  yellow: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40',
  red: 'bg-red-400/20 text-red-400 border-red-400/40',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  gray: 'bg-white/10 text-text-secondary border-white/20',
};

export function Badge({ children, color = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colorMap[color],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
