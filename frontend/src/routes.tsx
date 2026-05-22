import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { RegisterNightPage } from './pages/RegisterNightPage';
import { RegisterEpisodePage } from './pages/RegisterEpisodePage';
import { HistoryPage } from './pages/HistoryPage';
import { NightDetailPage } from './pages/NightDetailPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportPage } from './pages/ReportPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <HomePage />
      </Layout>
    ),
  },
  {
    path: '/registrar-noche',
    element: (
      <Layout>
        <RegisterNightPage />
      </Layout>
    ),
  },
  {
    path: '/registrar-episodio',
    element: (
      <Layout>
        <RegisterEpisodePage />
      </Layout>
    ),
  },
  {
    path: '/historial',
    element: (
      <Layout>
        <HistoryPage />
      </Layout>
    ),
  },
  {
    path: '/historial/:id',
    element: (
      <Layout>
        <NightDetailPage />
      </Layout>
    ),
  },
  {
    path: '/estadisticas',
    element: (
      <Layout>
        <StatisticsPage />
      </Layout>
    ),
  },
  {
    path: '/configuracion',
    element: (
      <Layout>
        <SettingsPage />
      </Layout>
    ),
  },
  {
    path: '/informe',
    element: (
      <Layout>
        <ReportPage />
      </Layout>
    ),
  },
]);
