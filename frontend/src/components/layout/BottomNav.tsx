import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, BarChart2, FileText, Clock3 } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/historial', label: 'Historial', icon: BookOpen },
  { to: '/estadisticas', label: 'Estadísticas', icon: BarChart2 },
  { to: '/informe', label: 'Informe', icon: FileText },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.85rem+var(--gaga-safe-bottom))] md:hidden">
      <div className="glass-panel relative mx-auto flex max-w-md rounded-[2rem] p-2">
        <Link
          to="/registro-rapido"
          aria-label="Registro rápido"
          className="absolute left-1/2 top-0 z-20 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl border border-medicalBlue/35 bg-night-950/88 text-medicalBlue shadow-glowBlue backdrop-blur-2xl transition active:scale-95"
        >
          <Clock3 size={23} />
        </Link>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'relative flex-1 rounded-[1.45rem] px-2 py-2.5 text-xs font-semibold transition-colors',
                'flex flex-col items-center gap-1',
                isActive ? 'text-white' : 'text-text-secondary hover:text-text-primary',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 rounded-[1.45rem] bg-medicalBlue/15 shadow-glowBlue"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <motion.span
                  className="relative z-10"
                  animate={{ y: isActive ? -1 : 0, scale: isActive ? 1.05 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={21} />
                </motion.span>
                <span className="relative z-10 leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
