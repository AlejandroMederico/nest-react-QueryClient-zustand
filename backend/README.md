# Urbano Backend (NestJS + TypeORM + JWT)

API del proyecto **Urbano** construida con **NestJS 7**, **TypeORM 0.2.x** y **PostgreSQL**. Incluye autenticación con **JWT**, **Swagger** en `/api/docs` y comandos de **migraciones** listos.

## 🚀 Stack

- NestJS ^7.5.1
- TypeORM ^0.2.32 + PostgreSQL (^8.6.0)
- Autenticación: @nestjs/jwt, passport-jwt
- Validación: class-validator, class-transformer
- Seguridad: helmet, cookie-parser
- Tests: Jest, Supertest, Newman (E2E)

## ✅ Requisitos

- Node.js 14–18 (recomendado 18 LTS)
- PostgreSQL 12+
- Yarn 1.x o npm

## 📦 Instalación

```bash
yarn install
# o
npm install
```

## 🔧 Scripts (del proyecto)

```json
{
  "prebuild": "rimraf dist",
  "build": "nest build",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
  "test:e2e": "newman run e2e/app.e2e.v1.test.json",
  "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
  "migration:gen": "yarn typeorm -f ormconfig.dev.js migration:generate -n InitSchema",
  "migration:run": "node ./node_modules/typeorm/cli.js migration:run",
  "migration:revert": "node ./node_modules/typeorm/cli.js migration:revert"
}
```

### Atajos útiles

- **Desarrollo**: `yarn start:dev`
- **Producción**: `yarn build && yarn start:prod`
- **Linter**: `yarn lint`
- **Pruebas**: `yarn test`, `yarn test:e2e`
- **Migraciones**: `yarn migration:gen`, `yarn migration:run`, `yarn migration:revert`

## 🔐 Variables de entorno (.env ejemplo)

Crea un archivo `.env` en la raíz del backend con algo como:

```
# Servidor
PORT=5000
NODE_ENV=development
COOKIE_SECRET=super-secret

# JWT
JWT_ACCESS_SECRET=change_me_access
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=change_me_refresh
JWT_REFRESH_EXPIRES=30d

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=urbano
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

# CORS (lista separada por comas, vacía = permitir local cli)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Admin bootstrap (opcional)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
BCRYPT_ROUNDS=12
```

> Ajusta nombres/usuarios si usas Docker Compose (por ej. `DATABASE_HOST=urbano-db`).

## ▶️ Ejecutar

```bash
# Desarrollo (watch)
yarn start:dev

# Producción
yarn build
yarn start:prod
```

- Swagger (no prod): `http://localhost:${PORT:-5000}/api/docs`

## 🗄️ Migraciones (TypeORM 0.2.x)

Este repo usa CLI de TypeORM 0.2 con `ormconfig.dev.js`:

```bash
# generar una nueva migración desde entidades
yarn migration:gen

# aplicar migraciones
yarn migration:run

# revertir última
yarn migration:revert
```

> Verifica la ruta de entidades y de salida en `ormconfig.dev.js` (debe apuntar a `dist/**/*.entity.js` tras `yarn build`).

## 🧱 Salud del esquema

- `synchronize=false` (recomendado para producción). Usa migraciones para cambios.
- Genera entidades `.ts`, compila a `dist/*.js` y **luego** ejecuta `migration:gen` o `migration:run`.

## 🐳 Docker

El proyecto incluye un **Dockerfile** en `/mnt/data/dockerfile`. Flujo sugerido (usa la receta incluida):

```dockerfile
# ---------- BUILDER ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Yarn ya viene, no lo reinstalamos
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Compilar a dist/
COPY tsconfig*.json ./
COPY src ./src
RUN yarn build

# ---------- RUNNER ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Cliente pg para esperar la DB
RUN apk add --no-cache postgresql-client

# Instalar solo prod deps
COPY package.json yarn.lock ./
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile --production=true

# Copiar compilado y ormconfig
COPY --from=builder /app/dist ./dist
COPY ormconfig.js ./ormconfig.js

EXPOSE 5000

# Esperar DB, correr migraciones (TypeORM 0.2.x) y arrancar API
CMD sh -c '\
    echo "⏳ Esperando base de datos..." && \
    until pg_isready -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USERNAME"; do sleep 2; done; \
    echo "✅ DB lista, ejecutando migraciones..." && \
    node ./node_modules/typeorm/cli.js migration:run && \
    echo "🚀 Iniciando API..." && \
    node dist/main.js \
    '
```

### Build & run (imagen sola)

```bash
docker build -t urbano-backend .
docker run --env-file .env --name urbano-backend -p 5000:5000 urbano-backend
```

> Si lo usas con `docker-compose`, ajusta `DATABASE_HOST` al **service name** de la base (p.ej. `urbano-db`) y expone `5000`.

## 🔌 Integración con el Frontend

- En **desarrollo**: el frontend (CRA) puede usar proxy a `http://localhost:5000`. Usa rutas `/api/...`.
- En **producción**: sirve el frontend con Nginx y define un **reverse proxy** al backend (o usa compose con red interna).

## 🧩 CORS y Cookies

- El backend permite **CORS** con allowlist por `CORS_ORIGINS`.
- Si usas cookies (refresh token), recuerda `credentials: true` en el cliente y `SameSite=None; Secure` cuando corresponda.

## 🩹 Troubleshooting

1. **No se generan migraciones**
   - Asegúrate de **compilar** (`yarn build`) y que `ormconfig.dev.js` lea `dist/**/*.entity.js`.
2. **`EntityMetadataNotFoundError`**
   - Rutas de entidades incorrectas o `dist` desactualizado. Ejecuta `rimraf dist && yarn build`.
3. **`connect ECONNREFUSED 127.0.0.1:5432` en Docker**
   - Usa `DATABASE_HOST=urbano-db` (service name) dentro de compose, no `localhost`.
4. **CORS bloquea requests**
   - Agrega el origen exacto al `.env` en `CORS_ORIGINS` y reinicia.
5. **JWT de refresco no persiste**
   - Confirma hash y almacenamiento del `refreshToken`, y tiempos (`JWT_REFRESH_EXPIRES=30d`).

## 📁 Estructura típica

```
src/
  auth/
  content/
  course/
  stats/
  user/
  main.ts
  app.module.ts
```

## 📜 Licencia

MIT (ajusta según tu preferencia).
