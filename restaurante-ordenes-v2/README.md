# Restaurante Órdenes

Aplicación web completa para gestionar órdenes de un restaurante.

## Stack
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: HTML + Bootstrap 5 + JavaScript
- **DB**: PostgreSQL (Render)

## Endpoints
- `POST /clientes/registrar` — crear cliente (email único)
- `POST /clientes/login` — login por email + teléfono
- `POST /ordenes` — crear orden (`cliente_id`, `platillo_nombre`, `notes`)
- `GET /ordenes/:clienteId` — listar órdenes del cliente
- `PUT /ordenes/:id/estado` — avanzar estado (pending → preparing → delivered)

## Base de datos
Ejecuta `database/schema.sql` en tu instancia PostgreSQL (nombre sugerido: `restaurante_ordenes_db`).

## Desarrollo local
1. `cd backend && npm install`
2. Copia `.env.example` a `.env` y ajusta `DATABASE_URL`. Si tu Postgres local no usa SSL, agrega `LOCAL_DEV=1`.
3. `npm start`
4. Abre `frontend/index.html` y edita `API_URL` a `http://localhost:3000`.

## Despliegue en Render

### 1) DB en Render
- Crea **PostgreSQL** en Render con nombre `restaurante_ordenes_db`.
- Entra a la consola **psql** y ejecuta:
  ```
  \i database/schema.sql
  ```

### 2) Backend (Web Service)
- Render → **New Web Service** (From Repo)
  - **Root Directory**: `backend`
  - **Build Command**: `npm install`
  - **Start Command**: `node server.js`
  - **Environment Variables**:
    - `DATABASE_URL` = (Connection string de la DB de Render)
    - `PORT` = `10000` (opcional)
- Deploy.

### 3) Frontend (Static Site)
- Render → **Static Site** (From Repo)
  - **Root Directory**: `frontend`
  - **Build Command**: *(vacío)*
  - **Publish Directory**: `frontend`
- Abre `frontend/app.js` y cambia `API_URL` por la URL pública del backend en Render.

### Alternativa: `render.yaml`
Puedes crear el servicio con blueprint usando `render.yaml` en la raíz del repo.
