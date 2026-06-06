# Importación histórica de glucosa 2026

El backend acepta el archivo Excel por un endpoint autenticado:

```text
POST /api/admin/import/glucose-excel
```

También existe una opción local autenticada que lee:

```text
backend/imports/Glucemias_2026_Ordenadas.xlsx
```

La regla automática crea un episodio cuando la glucosa es estrictamente menor
que `70 mg/dL`. Un valor de `70 mg/dL` no crea episodio.

## Resultado esperado del archivo actual

El workbook tiene 75 filas y 60 fechas únicas. Las mediciones de una misma fecha
se conservan cuando tienen distinta hora o glucosa, por lo que la primera
importación en una base vacía para 2026 devuelve:

```json
{
  "data": {
    "importedNightRecords": 75,
    "skippedDuplicates": 0,
    "createdEpisodes": 10,
    "errors": []
  }
}
```

Una segunda ejecución devuelve `0` importados, `75` duplicados omitidos y `0`
episodios nuevos.

## Verificación local

Desde la raíz del proyecto, iniciar PostgreSQL:

```bash
docker compose up -d
```

Iniciar el backend en otra terminal:

```bash
cd backend
mvn spring-boot:run
```

Iniciar el frontend en otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Obtener un JWT con el PIN vigente:

```bash
export GAGA_PIN='TU_PIN'
export TOKEN="$(
  curl -sS -X POST 'http://localhost:8081/api/auth/login' \
    -H 'Content-Type: application/json' \
    -d "{\"pin\":\"${GAGA_PIN}\"}" |
  jq -r '.data.token'
)"
```

Importar subiendo el archivo:

```bash
curl -sS -X POST \
  'http://localhost:8081/api/admin/import/glucose-excel' \
  -H "Authorization: Bearer ${TOKEN}" \
  -F 'file=@backend/imports/Glucemias_2026_Ordenadas.xlsx' |
jq
```

Alternativa local sin multipart:

```bash
curl -sS -X POST \
  'http://localhost:8081/api/admin/import/glucose-excel/local' \
  -H "Authorization: Bearer ${TOKEN}" |
jq
```

Verificar historial, episodios, estadísticas e informe:

```bash
curl -sS \
  'http://localhost:8081/api/night-records?from=2026-01-01&to=2026-12-31&page=0&size=100' \
  -H "Authorization: Bearer ${TOKEN}" |
jq

curl -sS \
  'http://localhost:8081/api/episodes?from=2026-01-01&to=2026-12-31&page=0&size=100' \
  -H "Authorization: Bearer ${TOKEN}" |
jq

curl -sS \
  'http://localhost:8081/api/statistics/summary?from=2026-01-01&to=2026-12-31' \
  -H "Authorization: Bearer ${TOKEN}" |
jq

curl -sS \
  'http://localhost:8081/api/reports/doctor-summary?from=2026-01-01&to=2026-12-31' \
  -H "Authorization: Bearer ${TOKEN}" |
jq
```

Finalmente, revisar en `http://localhost:5173` las pantallas Historial,
Estadísticas e Informe.

## Importación en Railway

1. Desplegar el backend actualizado en Railway.
2. Confirmar que `GET /api/health` responde.
3. Obtener un JWT desde el backend de Railway con el PIN vigente.
4. Subir el Excel desde la máquina local. El archivo no necesita existir dentro
   de Railway.

```bash
export RAILWAY_BACKEND='https://TU-BACKEND.up.railway.app'
export GAGA_PIN='TU_PIN'
export TOKEN="$(
  curl -sS -X POST "${RAILWAY_BACKEND}/api/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"pin\":\"${GAGA_PIN}\"}" |
  jq -r '.data.token'
)"

curl -sS -X POST \
  "${RAILWAY_BACKEND}/api/admin/import/glucose-excel" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F 'file=@backend/imports/Glucemias_2026_Ordenadas.xlsx' |
jq
```

Repetir las consultas de verificación reemplazando
`http://localhost:8081` por `${RAILWAY_BACKEND}`.
