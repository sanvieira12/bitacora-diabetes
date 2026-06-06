# Deploy hoy: Railway (backend + Postgres) y Vercel (frontend)

Esta guía asume que en local ya funciona todo con:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://localhost:8081`
- PostgreSQL: `localhost:5433`

No cambia puertos locales ni flujo local.

## 1) Railway: backend + PostgreSQL

1. En Railway, crear **New Project**.
2. Agregar servicio **PostgreSQL**.
3. Agregar servicio para el backend desde GitHub:
   - Repo: `bitacora-diabetes`
   - Root Directory: `backend` (o usar `backend/Dockerfile`)
4. En variables del servicio backend, configurar:

```env
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
JWT_SECRET=REEMPLAZAR_POR_SECRETO_LARGO
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

5. Generar `JWT_SECRET` seguro (32+ chars):

```bash
openssl rand -base64 64
```

6. Deploy del backend y obtener URL pública de Railway.
7. Probar health:

```bash
curl https://TU_BACKEND_RAILWAY/api/health
```

Debe responder:

```json
{"status":"ok","app":"gluconoche"}
```

## 2) Nota sobre DATABASE_URL de Railway

El backend acepta dos formatos:

- `DB_URL` en formato JDBC (`jdbc:postgresql://...`) (recomendado para Spring).
- `DATABASE_URL` estilo Railway (`postgres://...` o `postgresql://...`), que ahora se convierte automáticamente a JDBC al iniciar.

Igualmente, para evitar ambiguedad, usar `DB_URL` + `DB_USER` + `DB_PASSWORD` como en el bloque de arriba.

## 3) Vercel: frontend

1. En Vercel, importar repo desde GitHub.
2. Configurar:
   - Root Directory: `frontend`
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Variable de entorno:

```env
VITE_API_URL=https://TU_BACKEND_RAILWAY
```

4. Deploy.
5. Probar que carga la app y funciona login por PIN.

## 4) Cerrar CORS con URL real de Vercel

Cuando ya tengas la URL final de Vercel:

1. Volver a Railway.
2. Editar `CORS_ALLOWED_ORIGINS` y agregar la URL de Vercel:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,https://tu-front.vercel.app
```

3. Redeploy del backend.
4. Probar login y requests desde Vercel.

## 5) Checklist final

- `GET /api/health` responde en Railway.
- Frontend en Vercel carga sin 404 al refrescar rutas.
- Login por PIN funciona.
- Se puede crear:
  - Registro rapido
  - Noche
  - Episodio
- Historial carga datos.
- Prueba desde celular.

## Importación histórica

Después de desplegar el backend, seguir
[`HISTORICAL_GLUCOSE_IMPORT.md`](HISTORICAL_GLUCOSE_IMPORT.md) para subir el
Excel autenticado desde la máquina local y verificar historial, estadísticas e
informe.
