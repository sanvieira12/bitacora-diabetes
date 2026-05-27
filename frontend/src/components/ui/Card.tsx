import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', onClick, style }: CardProps) {
  return (
    <motion.div
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn(
        'glass-panel rounded-3xl',
        onClick && 'cursor-pointer transition-colors hover:border-medicalBlue/35',
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.div>
  );
}
