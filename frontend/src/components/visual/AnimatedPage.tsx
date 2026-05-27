import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/cn';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn('will-change-transform', className)}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14, filter: 'blur(10px)' }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(8px)' }}
      transition={{ duration: reducedMotion ? 0.16 : 0.42, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
