import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Moon } from 'lucide-react';

export function AppSplash() {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem('gaga_splash_seen'));
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem('gaga_splash_seen', 'true');
    const id = window.setTimeout(() => setVisible(false), reducedMotion ? 450 : 950);
    return () => window.clearTimeout(id);
  }, [reducedMotion, visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-night-950"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(12px)' }}
          transition={{ duration: reducedMotion ? 0.16 : 0.48, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(99,179,255,0.24),transparent_38%)]" />
          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reducedMotion ? 0.16 : 0.52, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="grid h-20 w-20 place-items-center rounded-[2rem] border border-white/10 bg-white/10 shadow-glowBlue backdrop-blur-2xl">
              <Moon className="text-medicalBlue" size={38} />
            </div>
            <div className="text-center">
              <p className="medical-text-gradient text-4xl font-extrabold tracking-tight">GAGA</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.28em] text-text-secondary">
                GlucoNoche
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
