import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { ChangePinPage } from './pages/ChangePinPage';
import { HomePage } from './pages/HomePage';
import { RegisterNightPage } from './pages/RegisterNightPage';
import { RegisterEpisodePage } from './pages/RegisterEpisodePage';
import { HistoryPage } from './pages/HistoryPage';
import { NightDetailPage } from './pages/NightDetailPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportPage } from './pages/ReportPage';

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/cambiar-pin', element: <ProtectedRoute><ChangePinPage /></ProtectedRoute> },

  { path: '/',                  element: <Protected><HomePage /></Protected> },
  { path: '/registrar-noche',   element: <Protected><RegisterNightPage /></Protected> },
  { path: '/registrar-episodio',element: <Protected><RegisterEpisodePage /></Protected> },
  { path: '/historial',         element: <Protected><HistoryPage /></Protected> },
  { path: '/historial/:id',     element: <Protected><NightDetailPage /></Protected> },
  { path: '/estadisticas',      element: <Protected><StatisticsPage /></Protected> },
  { path: '/configuracion',     element: <Protected><SettingsPage /></Protected> },
  { path: '/informe',           element: <Protected><ReportPage /></Protected> },

  { path: '*', element: <Navigate to="/" replace /> },
]);
