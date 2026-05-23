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
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Moon className="text-blue-400" size={20} />
          <span className="font-bold text-lg text-text-primary">GAGA</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/configuracion"
            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-text-secondary hover:text-text-primary"
            aria-label="Configuración"
          >
            <Settings size={20} />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-text-secondary hover:text-text-primary"
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
