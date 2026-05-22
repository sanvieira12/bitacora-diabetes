import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, mustChangePin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (mustChangePin && location.pathname !== '/cambiar-pin') {
    return <Navigate to="/cambiar-pin" replace />;
  }

  return <>{children}</>;
}
