# Urbano – Full-Stack Admin Panel (NestJS + React + Docker)

![CI](https://github.com/AlejandroMederico/nest-react-QueryClient-zustand/actions/workflows/ci.yml/badge.svg)

**🇪🇸 Español / 🇬🇧 English**

---

## 🚀 Descripción del Proyecto / Project Overview

---

## ⚡ Requisitos mínimos / Minimum Requirements

| Software       | Versión recomendada |
| -------------- | ------------------- |
| Node.js        | >= 18.x             |
| Yarn           | >= 1.22             |
| Docker         | >= 20.x             |
| Docker Compose | >= 2.x              |

---

**🇪🇸**  
Urbano Admin Panel es un proyecto full-stack que combina **NestJS**, **React**, **PostgreSQL** y **Docker** para crear un sistema de administración completo. Permite gestionar usuarios, cursos y contenidos con autenticación basada en roles, endpoints documentados con Swagger y un frontend moderno con diseño responsivo.

**🇬🇧**  
Urbano Admin Panel is a full-stack project built with **NestJS**, **React**, **PostgreSQL**, and **Docker**, providing a complete admin system. It includes user, course, and content management with role-based authentication, Swagger-documented endpoints, and a modern responsive frontend.

---

## 🧱 Arquitectura / Architecture

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│     Frontend        │ <--> │      Backend        │ <--> │     Database        │
│ (React + Tailwind)  │      │ (NestJS + TypeORM)  │      │   (PostgreSQL)      │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
         ▲                            ▲                          ▲
         │                            │                          │
         └──────────── Docker Compose ───────────────────────────┘
```

- **Frontend:** SPA con React, CRACO y TailwindCSS
- **Backend:** API REST con NestJS, JWT, Swagger y TypeORM
- **Base de Datos:** PostgreSQL persistente
- **Infraestructura:** Docker Compose para orquestación

---

## 📦 Stack Tecnológico / Tech Stack

| Componente    | Tecnología     | Versión |
| ------------- | -------------- | ------- |
| Backend       | NestJS         | 7.x     |
| Frontend      | React          | 17.x    |
| Base de Datos | PostgreSQL     | 15.x    |
| ORM           | TypeORM        | 0.2.x   |
| Autenticación | JWT            | -       |
| Contenedores  | Docker Compose | -       |

---

## 🐳 Despliegue con Docker Compose / Deploy with Docker Compose

---

## 🗄️ Migraciones y Base de Datos / Migrations & Database

**🇪🇸**
Para crear o actualizar el esquema de la base de datos, ejecuta:

```bash
cd backend
yarn typeorm migration:run
```

**🇬🇧**
To create or update the database schema, run:

```bash
cd backend
yarn typeorm migration:run
```

Para restaurar un backup, consulta la documentación de PostgreSQL.

---

**🇪🇸**  
La forma más rápida de ejecutar todo el sistema es con Docker Compose.

**🇬🇧**  
The fastest way to run the entire system is with Docker Compose.

````bash
# Clonar el repositorio
git clone https://github.com/yourusername/urbano-admin.git
cd urbano-admin


# Configuración de variables de entorno / Environment Variables Setup

En la carpeta `backend/` encontrarás el archivo `.env.example`, que sirve como guía para crear tu propio archivo `.env` con las variables necesarias para el proyecto. Solo debes copiarlo y personalizar los valores según tu entorno:

```bash
cp backend/.env.example backend/.env
````

Luego edita `backend/.env` con tus credenciales y configuraciones.

# Levantar todos los servicios

docker-compose up --build

````

✅ Esto iniciará:

- Frontend en: http://localhost:3000
- Backend API en: http://localhost:5000/api/v1
- Swagger Docs en: http://localhost:5000/api/docs

---

## 🔐 Variables de Entorno / Environment Variables

**backend/.env:**

```env
PORT=5000
NODE_ENV=development
COOKIE_SECRET=super-secret

# JWT
JWT_ACCESS_SECRET=access_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=refresh_secret
JWT_REFRESH_EXPIRES=30d

# Database
DATABASE_HOST=urbano-db
DATABASE_PORT=5432
DATABASE_NAME=urbano_db
DATABASE_USERNAME=myuser
DATABASE_PASSWORD=mypassword

# CORS
CORS_ORIGINS=http://localhost:3000
````

---

## 💻 Modo Desarrollo / Development Mode

**Backend:**

```bash
cd backend
yarn install
yarn start:dev
```

**Frontend:**

```bash
cd frontend
yarn install
yarn start
```

- Backend → http://localhost:5000
- Frontend → http://localhost:3000

---

## 🔐 Autenticación y Roles / Authentication & Roles

**🇪🇸**

- **Admin:** acceso total
- **Editor:** puede gestionar cursos y contenidos, pero solo editar su usuario
- **User:** acceso de solo lectura

**🇬🇧**

- **Admin:** full access
- **Editor:** manage courses and content, edit own user
- **User:** read-only access

---

## 🧪 Testing

**Backend Unit Tests:**

```bash
cd backend
yarn test
yarn test:watch
```

**E2E Tests:**

```bash
cd backend
yarn test:e2e
```

**Frontend Tests:**

```bash
cd frontend
yarn test
```

---

## 🤖 Integración Continua / Continuous Integration

Este proyecto incluye un workflow de GitHub Actions que ejecuta los tests y el build automáticamente en cada push o pull request.

Archivo: `.github/workflows/ci.yml`

---

- [ ] CI/CD con GitHub Actions
- [ ] API Rate Limiting
- [ ] Monitoreo con Prometheus + Grafana
- [ ] Integración con Redis para cache
- [ ] Estrategia de backups automáticos

---

## 🤝 Contribuciones / Contributing

**🇪🇸**

1. Haz un fork del repositorio
2. Crea tu rama: `git checkout -b feature/nueva-funcionalidad`
3. Realiza commits: `git commit -m "Add nueva funcionalidad"`
4. Sube tu rama: `git push origin feature/nueva-funcionalidad`
5. Crea un Pull Request

**🇬🇧**

1. Fork the repository
2. Create a branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m "Add new feature"`
4. Push the branch: `git push origin feature/new-feature`
5. Open a Pull Request

---

## 🔗 Enlaces Útiles / Useful Links

- [NestJS Docs](https://docs.nestjs.com/)
- [React Docs](https://react.dev/)
- [TypeORM Docs](https://typeorm.io/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Docs](https://docs.docker.com/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

## 📜 Licencia / License

**MIT License** – Este proyecto está abierto a modificaciones y contribuciones.  
**MIT License** – This project is open for modifications and contributions.

---

💡 _Built with ❤️ using NestJS, React, PostgreSQL, and Docker._
