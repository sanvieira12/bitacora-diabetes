import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={[
        'bg-surface border border-border rounded-2xl shadow-lg',
        onClick ? 'cursor-pointer hover:border-blue-500/50 transition-colors' : '',
        className,
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
