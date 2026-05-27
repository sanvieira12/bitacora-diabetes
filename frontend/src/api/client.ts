import axios from 'axios';

const TOKEN_KEY = 'gluconoche_token';
const LOCAL_FALLBACK_API_URL = 'http://localhost:8081';

function normalizeApiUrl(rawUrl?: string): string {
  const value = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!value) return LOCAL_FALLBACK_API_URL;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('localhost') || value.startsWith('127.0.0.1')) return `http://${value}`;
  return `https://${value}`;
}

const API_BASE_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

if (import.meta.env.DEV) {
  console.info('[GAGA] API base URL:', API_BASE_URL);
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem('gluconoche_must_change');
      // Redirect to login without using React Router (works from any context)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const status = err.response?.status;
    const backendError = err.response?.data?.error;
    const noResponse = !err.response;

    let msg = 'Error de conexión';
    if (typeof backendError === 'string' && backendError.trim()) {
      msg = backendError;
    } else if (noResponse) {
      msg = 'No se pudo conectar con el backend. Verificá URL del backend y CORS.';
    } else if (status === 0) {
      msg = 'Conexión bloqueada por el navegador o CORS.';
    } else if (status && status >= 500) {
      msg = 'Error interno del backend. Revisá Railway logs.';
    }

    return Promise.reject(new Error(msg));
  }
);

export { TOKEN_KEY };
export default client;
