# GlucoNoche local

## Flujo local

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Abrir la app:

```text
http://localhost:5173
```

Si `localhost:5173` está ocupado por otra app (por ejemplo Sonograma en `::1`), abrir:

```text
http://127.0.0.1:5173
```

Probar health del backend:

```bash
curl http://localhost:8081/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "app": "gluconoche"
}
```

## Puertos usados

- Backend: `8081`
- Frontend: `5173`
- PostgreSQL Docker: `localhost:5433` -> container `5432`

No usar `8080` para esta app. `8081` se eligió para evitar conflictos con otras aplicaciones locales.

El frontend está configurado con puerto estricto. Si `npm run dev` dice `Port 5173 is already in use`, hay otra app ocupando ese puerto y conviene detenerla antes de seguir, en vez de dejar que Vite mueva GAGA a otro puerto.

## Variables

Backend:

```text
PORT=8081
DB_URL=jdbc:postgresql://localhost:5433/gluconoche
DB_USER=gluconoche
DB_PASSWORD=gluconoche_dev
JWT_SECRET=<generar con openssl rand -base64 64>
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Frontend:

```text
VITE_API_URL=http://localhost:8081
```

No commitear archivos `.env` reales. Usar `.env.example` como referencia.

## Preparación futura para deploy

- Railway: backend Spring Boot + PostgreSQL.
- Vercel: frontend React/Vite.
- Backend ya acepta `PORT`, `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` y `CORS_ALLOWED_ORIGINS`.
- Frontend usa `VITE_API_URL`.
- Cuando exista la URL real de Vercel, agregarla a `CORS_ALLOWED_ORIGINS`.
- Cuando exista la URL real de Railway, configurar `VITE_API_URL` en Vercel.
