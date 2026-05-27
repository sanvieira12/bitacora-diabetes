import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedLayoutRoute } from './components/layout/ProtectedLayoutRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { ChangePinPage } from './pages/ChangePinPage';
import { HomePage } from './pages/HomePage';
import { RegisterNightPage } from './pages/RegisterNightPage';
import { QuickNightRegisterPage } from './pages/QuickNightRegisterPage';
import { RegisterEpisodePage } from './pages/RegisterEpisodePage';
import { HistoryPage } from './pages/HistoryPage';
import { NightDetailPage } from './pages/NightDetailPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportPage } from './pages/ReportPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/cambiar-pin', element: <ProtectedRoute><ChangePinPage /></ProtectedRoute> },

  { path: '/',                  element: <ProtectedLayoutRoute><HomePage /></ProtectedLayoutRoute> },
  { path: '/registrar-noche',   element: <ProtectedLayoutRoute><RegisterNightPage /></ProtectedLayoutRoute> },
  { path: '/registro-rapido',   element: <ProtectedRoute><QuickNightRegisterPage /></ProtectedRoute> },
  { path: '/registrar-episodio',element: <ProtectedLayoutRoute><RegisterEpisodePage /></ProtectedLayoutRoute> },
  { path: '/historial',         element: <ProtectedLayoutRoute><HistoryPage /></ProtectedLayoutRoute> },
  { path: '/historial/:id',     element: <ProtectedLayoutRoute><NightDetailPage /></ProtectedLayoutRoute> },
  { path: '/estadisticas',      element: <ProtectedLayoutRoute><StatisticsPage /></ProtectedLayoutRoute> },
  { path: '/configuracion',     element: <ProtectedLayoutRoute><SettingsPage /></ProtectedLayoutRoute> },
  { path: '/informe',           element: <ProtectedLayoutRoute><ReportPage /></ProtectedLayoutRoute> },

  { path: '*', element: <Navigate to="/" replace /> },
]);
