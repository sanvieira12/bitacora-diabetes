import { Link } from 'react-router-dom';
import { Settings, Moon } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Moon className="text-blue-400" size={20} />
          <span className="font-bold text-lg text-text-primary">GlucoNoche</span>
        </Link>
        <Link
          to="/configuracion"
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-text-secondary hover:text-text-primary"
          aria-label="Configuración"
        >
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}
