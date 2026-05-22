# GlucoNoche

Bitácora nocturna de glucosa personal para uso familiar. Herramienta de registro para llevar a la diabetóloga.

> **GlucoNoche es una herramienta de registro personal. No diagnostica, no prescribe ni reemplaza el criterio de un profesional de la salud. Consultá siempre a tu médica o diabetóloga ante cualquier duda.**

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS (dark mode)
- **Backend:** Java 21 + Spring Boot 3.x + PostgreSQL 16 + Flyway
- **Infra:** Docker Compose

## Requisitos

- Java 21+
- Node 18+
- Docker + Docker Compose

## Inicio rápido

### 1. Base de datos

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

El backend estará disponible en `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

La app estará disponible en `http://localhost:5173`.

## API

La documentación de la API está disponible en `http://localhost:8080/api` una vez iniciado el backend.

## Estructura

```
bitacora-diabetes/
├── frontend/       # React + Vite app
├── backend/        # Spring Boot app
└── docker-compose.yml
```

## Funcionalidades

- Registro nocturno de glucosa con nivel de atención automático (VERDE/AMARILLO/ROJO)
- Registro de episodios hipoglucémicos
- Historial con filtros
- Estadísticas y gráficos
- Exportación a PDF y CSV para llevar a la consulta médica
- Configuración de umbrales personalizados
