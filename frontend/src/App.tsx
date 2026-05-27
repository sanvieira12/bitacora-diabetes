import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './auth/AuthContext';
import { AppSplash } from './components/visual/AppSplash';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <AppSplash />
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        richColors={false}
        toastOptions={{
          className: 'glass-panel border-white/10 text-text-primary',
          style: {
            background: 'rgba(5, 8, 22, 0.82)',
            color: 'var(--gaga-text)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px',
            backdropFilter: 'blur(22px)',
          },
        }}
      />
    </AuthProvider>
  );
}
