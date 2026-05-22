# GlucoNoche — Guía de próximos pasos

Hoja de ruta práctica desde donde está el proyecto hoy hasta tenerlo en producción y con Juana usándolo.

---

## Estado actual del proyecto

- Backend completo: compila, todos los endpoints implementados.
- Frontend completo: builda sin errores TypeScript, 8 páginas, modo oscuro.
- DB migrations listas (V1 schema + V2 seed de Juana).
- Código pusheado a `main` en GitHub.
- **Lo que falta:** correr en local para verificar que funciona de punta a punta, ajustar umbrales a los valores reales de Juana, y luego hacer deploy.

---

## FASE 1 — Verificación local (hacer esto primero)

### Paso 1.1 — Requisitos en tu Mac

Verificá que tengas todo instalado:

```bash
docker --version       # Docker Desktop corriendo
java --version         # debe ser 21+
mvn --version          # Maven 3.9+
node --version         # Node 20+
```

Si falta algo:
- Docker Desktop: https://www.docker.com/products/docker-desktop
- Java 21: `brew install openjdk@21`
- Maven: `brew install maven`
- Node 20: `brew install node@20`

### Paso 1.2 — Levantar PostgreSQL

```bash
cd ~/Developer/bitacora-diabetes
docker compose up -d
```

Verificar que arrancó bien:

```bash
docker ps
# Debe aparecer: gluconoche-postgres   Up   0.0.0.0:5432->5432/tcp
```

### Paso 1.3 — Arrancar el backend

```bash
cd ~/Developer/bitacora-diabetes/backend
mvn spring-boot:run
```

En los logs debería aparecer:
```
GlucoNoche running for: Juana (00000000-0000-0000-0000-000000000001)
Started GlucoNocheApplication in X.XXX seconds
```

Si Flyway da error, probablemente Postgres no terminó de iniciar. Esperar 10 segundos y reintentar.

Verificar que el backend responde:

```bash
curl http://localhost:8080/api/settings
# Debe devolver JSON con los umbrales de glucosa
```

### Paso 1.4 — Arrancar el frontend

En otra terminal:

```bash
cd ~/Developer/bitacora-diabetes/frontend
npm install
npm run dev
```

Abrir: **http://localhost:5173**

### Paso 1.5 — Recorrida funcional completa

Hacer este recorrido en el navegador para validar que todo funciona de punta a punta:

- [ ] Se carga la pantalla de inicio (Inicio vacío, botones visibles)
- [ ] Ir a "Registrar noche" → completar glucosa (ej. 135), hora de dormir, calidad de sueño, estrés → guardar → ver el semáforo resultante
- [ ] Ir a "Registrar episodio" → completar datos básicos → guardar
- [ ] Ir a "Historial" → ver el registro creado
- [ ] Hacer click en el registro → ver detalle completo
- [ ] Ir a "Estadísticas" → ver los gráficos con el registro recién creado
- [ ] Ir a "Configuración" → cambiar un umbral → guardar → volver a "Registrar noche" y verificar que el semáforo cambia
- [ ] Ir a "Informe" → seleccionar rango → generar vista previa → descargar PDF → descargar CSV

Si algo no anda, los logs del backend (terminal donde corriste `mvn spring-boot:run`) van a mostrar el error.

---

## FASE 2 — Ajustar los umbrales a los valores reales de Juana

Los valores sembrados en la DB son genéricos. Antes de usar la app en serio, ajustarlos con los valores que le indicó la diabetóloga.

### Opción A — Desde la UI (recomendado)

1. Abrir http://localhost:5173/configuracion
2. Actualizar los campos:
   - **Umbral crítico:** glucosa por debajo de la cual el semáforo es ROJO
   - **Umbral bajo:** glucosa por debajo de la cual el semáforo es AMARILLO
   - **Objetivo mínimo / máximo antes de dormir:** rango verde
   - **Umbral alto:** glucosa por encima de la cual el semáforo es ROJO
3. Guardar

### Opción B — Directo en la migración V2 (para cambiar los defaults futuros)

Editar `backend/src/main/resources/db/migration/V2__seed_default_person_and_settings.sql` y cambiar los valores. Solo aplica si borrás el volumen de Docker y reiniciás desde cero.

### Lógica del semáforo para referencia

El cálculo está en [AttentionLevelCalculator.java](backend/src/main/java/com/gluconoche/nightrecord/AttentionLevelCalculator.java):

| Condición | Nivel |
|-----------|-------|
| Glucosa < umbral crítico (70) | ROJO |
| Glucosa > umbral alto (270) | ROJO |
| Glucosa < umbral bajo (100) | AMARILLO |
| Glucosa > objetivo máximo (180) | AMARILLO |
| Sin colación + glucosa < 120 | AMARILLO |
| Estrés alto | AMARILLO |
| Sueño malo | AMARILLO |
| Todo dentro del rango objetivo | VERDE |

Si la lógica no refleja la realidad clínica de Juana, el archivo a editar es `AttentionLevelCalculator.java` (líneas 23–74).

---

## FASE 3 — Deploy (cuando el MVP esté validado localmente)

### Paso 3.1 — Elegir dónde hostearlo

Opción más simple para empezar (todo gratuito o muy barato):

| Servicio | Para qué | Costo |
|----------|----------|-------|
| **Railway** | Backend Spring Boot | ~$5/mes (o gratis con límites) |
| **Railway** | PostgreSQL | ~$5/mes (incluido en plan de Railway) |
| **Vercel** | Frontend React | Gratis para proyectos personales |

Alternativas: Fly.io + Neon.tech para DB, o Render.

### Paso 3.2 — Dockerizar el backend

Crear `backend/Dockerfile`:

```dockerfile
# Stage 1: build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2: runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Verificar que buildea:

```bash
cd backend
docker build -t gluconoche-backend .
```

### Paso 3.3 — Variables de entorno para producción

El backend necesita estas variables (nunca hardcodear, pasarlas desde Railway/Render):

```
DB_URL=jdbc:postgresql://<host>:<puerto>/gluconoche
DB_USER=<usuario>
DB_PASSWORD=<contraseña segura>
```

El frontend necesita un archivo `.env.production` (no commitearlo, configurarlo en Vercel):

```
VITE_API_URL=https://<tu-dominio-backend>
```

### Paso 3.4 — CORS en producción

Editar [CorsConfig.java](backend/src/main/java/com/gluconoche/config/CorsConfig.java) para agregar el dominio de producción del frontend:

```java
config.setAllowedOrigins(List.of(
    "http://localhost:5173",
    "http://localhost:3000",
    "https://tu-frontend.vercel.app"  // agregar esto
));
```

### Paso 3.5 — Deploy del backend en Railway

1. Ir a railway.app → New Project → Deploy from GitHub repo
2. Seleccionar `bitacora-diabetes`, elegir directorio `backend/`
3. Railway detecta el Dockerfile automáticamente
4. Agregar las variables de entorno (DB_URL, DB_USER, DB_PASSWORD)
5. Agregar un servicio PostgreSQL en Railway y conectarlo

### Paso 3.6 — Deploy del frontend en Vercel

```bash
cd frontend
npm install -g vercel
vercel
```

O conectar el repo de GitHub desde vercel.com. Configurar:
- Build command: `npm run build`
- Output directory: `dist`
- Variable de entorno: `VITE_API_URL=https://tu-backend-en-railway.up.railway.app`

### Paso 3.7 — Verificar en producción

Repetir la recorrida del Paso 1.5 con la URL de producción.

---

## FASE 4 — Mejoras post-MVP (en orden de prioridad sugerido)

### Prioridad alta

- [ ] **Tests del backend** — al menos para `AttentionLevelCalculator` (la lógica clínica más crítica) y los servicios principales
- [ ] **Edición de registros desde el historial** — actualmente NightDetailPage muestra botón Editar pero la navegación a formulario pre-cargado puede necesitar ajuste
- [ ] **Validación de rango de fechas en el frontend** — que `from` no sea mayor que `to`
- [ ] **Manejo de errores visible en la UI** — los errores del backend se capturan pero algunos pueden no mostrarse al usuario

### Prioridad media

- [ ] **PWA / instalar en celular** — agregar `manifest.json` y service worker para que Juana pueda abrirla como app nativa en el iPhone
- [ ] **Modo offline básico** — guardar un registro aunque no haya internet y sincronizar después
- [ ] **Notificación/recordatorio** de registrar antes de dormir — se puede hacer como PWA push o simplemente un shortcut en la pantalla de inicio del iPhone

### Prioridad baja

- [ ] **Autenticación** — si la app sale de la red local o se hostea en internet público, agregar un PIN o contraseña simple
- [ ] **Backup manual** — botón en la UI para descargar todos los datos como CSV (ya está el endpoint, solo agregar botón de "backup completo")
- [ ] **Integración con sensor continuo** — si Juana usa un CGM como Libre o Dexcom, se puede importar datos vía su API

---

## FASE 5 — Mantenimiento

### Backups de la base de datos

En local, el volumen de Docker persiste en `postgres-data`. Para hacer un backup manual:

```bash
docker exec gluconoche-postgres pg_dump -U gluconoche gluconoche > backup_$(date +%Y%m%d).sql
```

En producción, Railway y Neon.tech tienen backups automáticos configurables.

### Actualizar dependencias

```bash
# Frontend
cd frontend && npm outdated && npm update

# Backend
cd backend && mvn versions:display-dependency-updates
```

### Ver logs en producción

```bash
# Railway CLI
railway logs --tail

# O desde el dashboard de Railway
```

---

## Referencia rápida de comandos

```bash
# Iniciar todo en local
docker compose up -d
cd backend && mvn spring-boot:run        # terminal 1
cd frontend && npm run dev               # terminal 2

# Detener todo
docker compose down

# Ver logs de Postgres
docker logs gluconoche-postgres

# Compilar backend sin correr
cd backend && mvn compile

# Build de producción del frontend
cd frontend && npm run build

# Conectarse a la DB directamente
docker exec -it gluconoche-postgres psql -U gluconoche -d gluconoche
```
