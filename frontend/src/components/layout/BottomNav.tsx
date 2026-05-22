import { NavLink } from 'react-router-dom';
import { Home, BookOpen, BarChart2, FileText } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/historial', label: 'Historial', icon: BookOpen },
  { to: '/estadisticas', label: 'Estadísticas', icon: BarChart2 },
  { to: '/informe', label: 'Informe', icon: FileText },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface/90 backdrop-blur-md border-t border-border md:hidden">
      <div className="flex">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors text-xs font-medium',
                isActive ? 'text-blue-400' : 'text-text-secondary hover:text-text-primary',
              ].join(' ')
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
