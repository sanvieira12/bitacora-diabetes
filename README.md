# GlucoNoche

Diario glucémico nocturno personal para el seguimiento de diabetes. Diseñado para uso individual, optimizado para registro rápido a la madrugada.

> **Aviso médico:** Esta aplicación es una herramienta de registro personal y no reemplaza el diagnóstico, tratamiento ni criterio clínico de su médica o equipo de salud. Ante cualquier duda o emergencia, consulte a su profesional de salud.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Java 21 · Spring Boot 3.2 · Spring Data JPA |
| Base de datos | PostgreSQL 16 |
| Migraciones | Flyway |
| PDF | iText 7 |
| CSV | Apache Commons CSV |
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS |
| Gráficos | Recharts |
| Formularios | React Hook Form + Zod |

## Requisitos

- Node.js 20+
- Java 21+
- Docker Desktop (para PostgreSQL)
- Maven 3.9+ (`mvn` en PATH)

## Autenticación

La app requiere un PIN de 4 dígitos para acceder.

- **PIN inicial:** `0000`
- Al primer ingreso, la app obliga a cambiarlo antes de poder usar nada.
- El PIN se puede cambiar desde **Configuración → Cambiar PIN**.
- Después de 5 intentos fallidos, el acceso se bloquea 15 minutos.

## Cómo correr en local

### 1. Levantar la base de datos

```bash
docker compose up -d
```

Esto crea el contenedor PostgreSQL en `localhost:5432` con base de datos `gluconoche`, usuario `gluconoche`, contraseña `gluconoche_dev`.

### 2. Arrancar el backend

```bash
cd backend
mvn spring-boot:run
```

El servidor arranca en `http://localhost:8080`. Flyway aplica las migraciones automáticamente al primer inicio (crea las tablas y siembra a Juana como usuaria).

Para desarrollo local con SQL en consola:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### 3. Arrancar el frontend

```bash
cd frontend
npm install
npm run dev
```

La app abre en `http://localhost:5173`. Las llamadas a `/api/*` se proxean automáticamente al backend en 8080.

### 4. Abrir en el navegador

```
http://localhost:5173
```

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/night-records` | Listado paginado con filtros |
| POST | `/api/night-records` | Crear registro nocturno |
| PUT | `/api/night-records/:id` | Editar registro |
| DELETE | `/api/night-records/:id` | Eliminar registro |
| GET | `/api/episodes` | Listado paginado de episodios |
| POST | `/api/episodes` | Crear episodio hipoglucémico |
| GET | `/api/statistics/summary` | Estadísticas del período |
| GET | `/api/statistics/glucose-trend` | Tendencia de glucosa |
| GET | `/api/statistics/episode-frequency` | Frecuencia de episodios |
| GET | `/api/statistics/factors` | Factores (actividad, estrés, etc.) |
| GET | `/api/settings` | Obtener configuración |
| PUT | `/api/settings` | Actualizar umbrales y notas |
| GET | `/api/reports/doctor-summary` | JSON con resumen para médica |
| GET | `/api/reports/export/pdf` | Descarga PDF del informe |
| GET | `/api/reports/export/csv` | Descarga ZIP con CSVs |

Todos los endpoints aceptan `?from=YYYY-MM-DD&to=YYYY-MM-DD`. Los de listado aceptan `?page=0&size=20`.

## Estructura del proyecto

```
.
├── docker-compose.yml          # PostgreSQL 16
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/gluconoche/
│       ├── common/             # ApiResponse, GlobalExceptionHandler, enums, JSONB converter
│       ├── config/             # CORS
│       ├── person/             # Entidad persona (usuario único: Juana)
│       ├── settings/           # Umbrales y configuración
│       ├── nightrecord/        # Registro nocturno + calculador de atención
│       ├── episode/            # Episodios hipoglucémicos
│       ├── statistics/         # Estadísticas agregadas
│       └── report/             # Generación PDF/CSV
└── frontend/
    └── src/
        ├── api/                # Clientes HTTP
        ├── components/         # UI, layout, gráficos, formularios
        ├── hooks/              # useNightRecords, useSettings
        ├── lib/                # formatters, dateUtils
        ├── pages/              # HomePage, RegisterNightPage, RegisterEpisodePage,
        │                       # HistoryPage, NightDetailPage, StatisticsPage,
        │                       # SettingsPage, ReportPage
        └── types/              # Tipos TypeScript
```

## Lógica de niveles de atención

El backend calcula automáticamente el nivel de atención al guardar cada registro:

- **ROJO:** glucosa < umbral crítico (por defecto 70 mg/dL) o glucosa > umbral alto (270 mg/dL)
- **AMARILLO:** glucosa < umbral bajo (100), glucosa > objetivo máximo (180), sin colación con glucosa < 120, estrés alto, sueño malo
- **VERDE:** glucosa dentro del rango objetivo [110, 180 mg/dL]

Los umbrales se configuran desde la pantalla de configuración.

## Variables de entorno (producción)

| Variable | Descripción |
|----------|-------------|
| `DB_URL` | JDBC URL de PostgreSQL |
| `DB_USER` | Usuario de la DB |
| `DB_PASSWORD` | Contraseña de la DB |
| `JWT_SECRET` | String aleatorio ≥ 32 caracteres. Generá con: `openssl rand -base64 64` |

## Próximos pasos para deploy

1. Generar `JWT_SECRET` con `openssl rand -base64 64` y configurarlo como variable de entorno
2. Crear `backend/src/main/resources/application-prod.yml` con variables de entorno reales
2. Dockerizar el backend (`Dockerfile` multi-stage con Maven + JRE 21)
3. Agregar `frontend/.env.production` con la URL real del backend
4. Hacer build del frontend con `npm run build` y servir con Nginx o similar
5. Usar un secreto real para la BD (no la contraseña de dev)
6. Configurar SSL/TLS para el backend
7. Agregar backups automáticos de PostgreSQL
