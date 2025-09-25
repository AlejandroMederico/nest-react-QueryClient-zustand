# 🚀 Admin Panel Project - NestJS + React

**Panel de administración full-stack con arquitectura moderna y mejores prácticas de DevOps.**

## ✨ Resumen Ejecutivo

Este proyecto implementa un panel de administración completo con:

- **Backend**: API REST robusta con NestJS, autenticación JWT y autorización basada en roles
- **Frontend**: SPA moderna con React, TypeScript y diseño responsivo
- **Base de Datos**: PostgreSQL con TypeORM para persistencia de datos
- **DevOps**: Infraestructura completa con Docker, optimizada para desarrollo y producción

### 🎯 Características Principales

- 🔐 **Autenticación JWT** con refresh tokens (15min/1año)
- 👥 **Autorización RBAC** (Admin, Editor, User)
- 📱 **Diseño responsivo** con TailwindCSS
- 🔄 **API RESTful** con documentación Swagger
- 🐳 **Docker completo** con mejores prácticas
- 📊 **Healthchecks** y monitoreo integrado
- 🚀 **Performance optimizada** con cache y compresión

---

# 📋 Assumptions

- User can have only 1 role.
- 3 Roles: Admin, Editor, User (Authorizations of roles are described down below)
- There are 3 data types. Users, Courses and Contents.
- Courses can have multiple contents.

**Admin**

| Table    | Read | Write | Update | Delete |
| -------- | ---- | ----- | ------ | ------ |
| Users    | ✓    | ✓     | ✓      | ✓      |
| Courses  | ✓    | ✓     | ✓      | ✓      |
| Contents | ✓    | ✓     | ✓      | ✓      |

**Editor**

| Table    | Read   | Write | Update | Delete |
| -------- | ------ | ----- | ------ | ------ |
| Users    | itself |       | itself |        |
| Courses  | ✓      | ✓     | ✓      |        |
| Contents | ✓      | ✓     | ✓      |        |

**User**

| Table    | Read   | Write | Update | Delete |
| -------- | ------ | ----- | ------ | ------ |
| Users    | itself |       | itself |        |
| Courses  | ✓      |       |        |        |
| Contents | ✓      |       |        |        |

# Tech Stack

## **Tecnologías Principales**

| Componente        | Tecnología  | Versión | Descripción                  |
| ----------------- | ----------- | ------- | ---------------------------- |
| **Backend**       | NestJS      | 7.5.1   | Framework Node.js progresivo |
| **Frontend**      | React       | 17.0.2  | Librería UI con TypeScript   |
| **Base de Datos** | PostgreSQL  | 15      | Base de datos relacional     |
| **ORM**           | TypeORM     | 0.2.32  | Mapeo objeto-relacional      |
| **Autenticación** | JWT         | 7.2.0   | Tokens de acceso y refresh   |
| **Testing**       | Jest        | 26.6.3  | Framework de testing         |
| **Build Tool**    | Webpack     | 4.0.3   | Bundler para React           |
| **Styling**       | TailwindCSS | 2.x     | Framework CSS utility-first  |

## **Arquitectura de Contenedores**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (NestJS)      │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ • nginx:1.24    │    │ • node:17       │    │ • postgres:15   │
│ • Multi-stage   │    │ • Multi-stage   │    │ • Persistente   │
│ • Healthchecks  │    │ • Healthchecks  │    │ • Healthchecks  │
│ • Gzip + Cache  │    │ • No-root user  │    │ • Volúmenes     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Docker Compose │
                    │  • Orchestration│
                    │  • Networking   │
                    │  • Health deps  │
                    └─────────────────┘
```

## **Características Técnicas Implementadas**

### **🔒 Seguridad**

- ✅ Usuario no-root en todos los contenedores
- ✅ Headers de seguridad (XSS, CSP, HSTS)
- ✅ Variables de entorno para datos sensibles
- ✅ Validación y sanitización de datos
- ✅ Rate limiting y CORS configurado

### **⚡ Performance**

- ✅ Multi-stage builds optimizados
- ✅ Compresión gzip habilitada
- ✅ Cache de assets estático (1 año)
- ✅ Proxy reverso con timeouts
- ✅ Pool de conexiones de BD optimizado

### **📊 Observabilidad**

- ✅ Healthchecks automáticos (30s interval)
- ✅ Logging estructurado por servicio
- ✅ Métricas de estado en tiempo real
- ✅ Endpoints de health monitoring
- ✅ Debugging tools integrados

### **🛠️ DevOps**

- ✅ Docker Compose orchestration
- ✅ Hot reload en desarrollo
- ✅ Environment-based configuration
- ✅ Database migrations automatizadas
- ✅ CI/CD ready configuration

# Features

- Swagger Documentation
- JWT authentication with refresh & access token
- Role based authorization
- Data filtering
- Fully responsive design

# Authentication

Application generates 2 tokens on login. Access token and refresh token. Access token has a lifetime of 15 minutes and the refresh token has a lifetime of 1 year.

# First Login

On the first run, application inserts a new admin to the database.

- **username**: admin
- **password**: admin123

# How to setup

## **🚀 Deploy with Docker (Recomendado)**

La aplicación está completamente dockerizada con las mejores prácticas de seguridad y performance. Incluye healthchecks, usuario no-root, y optimizaciones avanzadas.

### **Requisitos Previos**

- Docker y Docker Compose instalados
- Puerto 3000 y 5000 disponibles

### **Inicio Rápido**

```bash
# Clonar el repositorio
git clone <repository-url>
cd nest-react-admin

# Levantar todos los servicios
docker-compose up --build

# En otra terminal, verificar que todo esté funcionando
docker-compose ps
```

### **URLs de Acceso**

| Servicio         | URL                                 | Descripción                |
| ---------------- | ----------------------------------- | -------------------------- |
| **Frontend**     | http://localhost:3000               | Aplicación React principal |
| **Backend API**  | http://localhost:5000/api/v1        | API REST con documentación |
| **Swagger Docs** | http://localhost:5000/api/docs      | Documentación interactiva  |
| **Health Check** | http://localhost:5000/api/v1/health | Estado del backend         |

### **Credenciales Iniciales**

- **Username**: admin
- **Password**: admin123

### **Comandos Útiles de Docker**

```bash
# Construir e iniciar servicios
docker-compose up --build

# Iniciar en modo detached (background)
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Reiniciar un servicio específico
docker-compose restart backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡cuidado con los datos!)
docker-compose down -v

# Ver estado de los servicios
docker-compose ps

# Ejecutar comandos dentro de un contenedor
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec database psql -U carna -d carna-database
```

### **Características de Docker Implementadas**

#### **🔒 Seguridad**

- Usuario no-root en todos los contenedores
- Headers de seguridad en nginx
- Variables de entorno para datos sensibles
- Healthchecks para monitoreo de estado

#### **⚡ Performance**

- Multi-stage builds optimizados
- Compresión gzip habilitada
- Cache de assets estático (1 año)
- Proxy reverso configurado

#### **📊 Monitoreo**

- Healthchecks automáticos cada 30 segundos
- Logs estructurados por servicio
- Estados de salud visibles en `docker-compose ps`

#### **🗄️ Persistencia de Datos**

- Volumen PostgreSQL persistente
- Datos mantenidos entre reinicios
- Backup automático de la base de datos

## **💻 Running locally (Desarrollo)**

## Backend

First you have to postgresql installed on your computer.

Edit the database properties on the backend/.env file.

On backend directory

### Installing the dependencies

```bash
yarn
```

### Running the app

```bash
$ yarn start
```

Backend will be started on http://localhost:5000

Swagger Docs on http://localhost:5000/api/docs

## Frontend

On frontend directory

### Installing the dependencies

```bash
yarn
```

### Running the app

```bash
$ yarn start
```

Frontend will be started on http://localhost:3000

# Testing

## **Unit Testing**

### Backend

```bash
cd backend
yarn test
yarn test:watch          # Modo watch
yarn test:cov           # Con coverage
```

### Frontend

```bash
cd frontend
yarn test
```

## **E2E API Testing**

Primero iniciar el backend (local o con Docker).

```bash
cd backend

# Instalar dependencias
yarn

# Iniciar backend
yarn start

# Ejecutar tests E2E
yarn test:e2e
```

**Nota**: Los tests E2E inician sesión como **admin/admin123** y crean usuarios de prueba. Si cambias estas credenciales, los tests fallarán.

---

# 🔧 Troubleshooting

## **Problemas Comunes con Docker**

### **1. Puerto ya en uso**

```bash
# Verificar qué usa los puertos
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Matar procesos que usan los puertos
sudo kill -9 <PID>

# O cambiar los puertos en docker-compose.yml
```

### **2. Contenedores no inician**

```bash
# Ver logs detallados
docker-compose logs -f

# Reconstruir contenedores
docker-compose down
docker-compose up --build --force-recreate

# Limpiar cache de Docker
docker system prune -f
```

### **3. Base de datos no responde**

```bash
# Verificar estado de PostgreSQL
docker-compose logs database

# Reiniciar solo la base de datos
docker-compose restart database

# Conectar manualmente a PostgreSQL
docker-compose exec database psql -U carna -d carna-database
```

### **4. Frontend no carga**

```bash
# Verificar que el backend esté respondiendo
curl http://localhost:5000/api/v1/health

# Verificar logs del frontend
docker-compose logs frontend

# Verificar configuración de nginx
docker-compose exec frontend cat /etc/nginx/nginx.conf
```

### **5. Problemas de permisos**

```bash
# Si hay problemas de permisos en Linux
sudo chown -R $USER:$USER .
chmod -R 755 .

# Reconstruir con usuario correcto
docker-compose down
docker-compose up --build
```

## **🔍 Debugging Avanzado**

### **Acceder a contenedores**

```bash
# Backend (Node.js)
docker-compose exec backend sh

# Frontend (nginx)
docker-compose exec frontend sh

# Database (PostgreSQL)
docker-compose exec database psql -U carna -d carna-database
```

### **Ver variables de entorno**

```bash
# Dentro del contenedor backend
docker-compose exec backend env | grep -E "(DATABASE|JWT|PORT)"
```

### **Logs de aplicación**

```bash
# Todos los logs
docker-compose logs -f --tail=100

# Logs con timestamps
docker-compose logs -f -t

# Logs de un servicio específico
docker-compose logs -f backend frontend database
```

## **📈 Monitoreo y Healthchecks**

### **Verificar estado de servicios**

```bash
# Estado general
docker-compose ps

# Healthchecks detallados
docker-compose exec backend node healthcheck.js
curl http://localhost:5000/api/v1/health
curl http://localhost:3000/
```

### **Métricas de performance**

```bash
# Uso de recursos
docker stats

# Logs de healthchecks
docker-compose events --filter event=health_status
```

---

# 🚀 Producción

## **Configuración de Producción**

### **Variables de Entorno Importantes**

```bash
# En backend/.env
NODE_ENV=production
DATABASE_HOST=database
DATABASE_PORT=5432
JWT_SECRET=<generate-secure-secret>
CORS_ORIGINS=https://yourdomain.com
```

### **Despliegue en Producción**

```bash
# Construir imágenes optimizadas
docker-compose -f docker-compose.prod.yml up --build -d

# Usar secrets en lugar de .env
docker-compose -f docker-compose.prod.yml --env-file=.env.prod up -d

# Actualizar imágenes
docker-compose pull
docker-compose up --build -d
```

### **Backup y Restauración**

```bash
# Backup de base de datos
docker-compose exec database pg_dump -U carna carna-database > backup.sql

# Restaurar backup
docker-compose exec -T database psql -U carna -d carna-database < backup.sql
```

### **Logs de Producción**

```bash
# Rotar logs
docker-compose logs --tail=1000 > production.log

# Monitoreo continuo
docker-compose logs -f -t > production.log &
```

---

# 📚 Recursos Adicionales

- [Documentación NestJS](https://docs.nestjs.com/)
- [Documentación React](https://reactjs.org/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [nginx Documentation](https://nginx.org/en/docs/)
- [TypeORM Documentation](https://typeorm.io/)
- [TailwindCSS Guide](https://tailwindcss.com/docs)

---

# 🎯 Próximos Pasos Recomendados

## **Mejoras Sugeridas**

### **Alta Prioridad**

- [ ] **CI/CD Pipeline**: GitHub Actions o GitLab CI
- [ ] **Testing E2E**: Cypress o Playwright para frontend
- [ ] **API Rate Limiting**: Implementar límites de requests
- [ ] **Database Backups**: Configuración de backups automáticos
- [ ] **SSL/HTTPS**: Configuración para producción

### **Media Prioridad**

- [ ] **Monitoring**: Prometheus + Grafana
- [ ] **Logging**: ELK Stack o similar
- [ ] **Caching**: Redis para sesiones y cache
- [ ] **File Upload**: Configuración de almacenamiento de archivos
- [ ] **Email Service**: Integración con servicio de emails

### **Baja Prioridad**

- [ ] **API Versioning**: Estrategia de versionado
- [ ] **Internationalization**: i18n para múltiples idiomas
- [ ] **PWA Features**: Service workers y offline support
- [ ] **Mobile App**: React Native companion app
- [ ] **Analytics**: Google Analytics o similar

## **Mejores Prácticas**

### **Desarrollo**

- ✅ **Git Flow**: Usar ramas feature/bugfix/release
- ✅ **Code Reviews**: Revisión de código obligatoria
- ✅ **Testing**: Cobertura mínima del 80%
- ✅ **Documentation**: Documentar APIs y componentes
- ✅ **Environment Parity**: Entornos consistentes

### **Producción**

- ✅ **Zero Downtime**: Despliegues sin interrupción
- ✅ **Backups**: Estrategia de backup y recovery
- ✅ **Monitoring**: Alertas y dashboards
- ✅ **Security**: Actualizaciones regulares
- ✅ **Performance**: Optimización continua

---

## **🤝 Contribuir al Proyecto**

1. **Fork** el repositorio
2. **Crear** rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** cambios (`git commit -am 'Add nueva funcionalidad'`)
4. **Push** rama (`git push origin feature/nueva-funcionalidad`)
5. **Crear** Pull Request

### **Estándares de Código**

- TypeScript estricto habilitado
- ESLint y Prettier configurados
- Commits convencionales
- Tests para nuevas funcionalidades
- Documentación actualizada

---

## **📞 Soporte**

Para soporte técnico o preguntas:

- 📧 **Email**: support@yourcompany.com
- 💬 **Chat**: [Discord/Slack Channel]
- 📖 **Wiki**: [Internal Wiki]
- 🐛 **Issues**: [GitHub Issues]

---

## **📜 Licencia**

Este proyecto está bajo la licencia **UNLICENSED**. Todos los derechos reservados.

---

<div align="center">

**¡Gracias por usar nuestro Admin Panel!**

_Construido con ❤️ usando NestJS + React + Docker_

</div>
