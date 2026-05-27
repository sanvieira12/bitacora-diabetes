import { Link, useNavigate } from 'react-router-dom';
import { Settings, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

export function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="safe-pt sticky top-0 z-40 px-3 pt-2">
      <div className="glass-panel mx-auto flex h-16 max-w-2xl items-center justify-between rounded-[1.65rem] px-4">
        <Link to="/" className="group flex items-center gap-3" aria-label="Ir al inicio">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/10 shadow-glowBlue transition-transform duration-300 group-hover:scale-105">
            <Moon className="text-medicalBlue" size={21} />
          </span>
          <span>
            <span className="block text-lg font-extrabold leading-none tracking-tight text-text-primary">GAGA</span>
            <span className="mt-0.5 block text-[11px] font-medium text-text-secondary">noche en calma</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/configuracion"
            className="rounded-2xl border border-white/0 p-2.5 text-text-secondary transition-all duration-200 hover:border-white/10 hover:bg-white/10 hover:text-text-primary"
            aria-label="Configuración"
          >
            <Settings size={20} />
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-2xl border border-white/0 p-2.5 text-text-secondary transition-all duration-200 hover:border-white/10 hover:bg-white/10 hover:text-text-primary"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
