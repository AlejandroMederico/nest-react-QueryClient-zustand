<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Backend - Nest React Admin

This is the backend service for the Nest React Admin project, built using the [NestJS](https://nestjs.com/) framework. It provides APIs for user authentication, content management, course handling, and statistics.

Este es el servicio backend para el proyecto Nest React Admin, construido con el framework [NestJS](https://nestjs.com/). Proporciona APIs para autenticación de usuarios, gestión de contenido, manejo de cursos y estadísticas.

## Features / Características

- **Authentication / Autenticación**: JWT-based authentication with role-based access control.
  Autenticación basada en JWT con control de acceso basado en roles.
- **Content Management / Gestión de Contenido**: APIs for managing content entities.
  APIs para gestionar entidades de contenido.
- **Course Management / Gestión de Cursos**: APIs for managing courses.
  APIs para gestionar cursos.
- **Statistics / Estadísticas**: APIs for retrieving and managing statistics.
  APIs para recuperar y gestionar estadísticas.
- **Swagger Documentation / Documentación Swagger**: Interactive API documentation available at `/api/docs` (in non-production environments).
  Documentación interactiva de la API disponible en `/api/docs` (en entornos no productivos).
- **Admin User Creation / Creación de Usuario Admin**: Automatically creates an admin user on first use if none exists.
  Crea automáticamente un usuario administrador en el primer uso si no existe.

## Project Structure / Estructura del Proyecto

- **auth/**: Handles authentication and authorization.
  Maneja la autenticación y autorización.
- **content/**: Manages content-related entities and services.
  Gestiona entidades y servicios relacionados con el contenido.
- **course/**: Manages course-related entities and services.
  Gestiona entidades y servicios relacionados con los cursos.
- **stats/**: Handles statistics-related APIs.
  Maneja las APIs relacionadas con estadísticas.
- **user/**: Manages user-related entities and services.
  Gestiona entidades y servicios relacionados con los usuarios.

## Installation / Instalación

```bash
$ npm install
```

## Environment Variables / Variables de Entorno

The following environment variables are required for the application to run:
Las siguientes variables de entorno son necesarias para que la aplicación funcione:

- `PORT`: The port on which the server will run (default: 5000).
  El puerto en el que se ejecutará el servidor (por defecto: 5000).
- `NODE_ENV`: The environment mode (`development` or `production`).
  El modo de entorno (`development` o `production`).
- `COOKIE_SECRET`: Secret key for signing cookies.
  Clave secreta para firmar cookies.
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins.
  Lista separada por comas de orígenes permitidos para CORS.
- `ADMIN_USERNAME`: Default admin username.
  Nombre de usuario administrador por defecto.
- `ADMIN_PASSWORD`: Default admin password.
  Contraseña de administrador por defecto.
- `BCRYPT_ROUNDS`: Number of salt rounds for bcrypt (default: 12).
  Número de rondas de sal para bcrypt (por defecto: 12).

## Running the App / Ejecutando la Aplicación

```bash
# development / desarrollo
$ npm run start

# watch mode / modo watch
$ npm run start:dev

# production mode / modo producción
$ npm run start:prod
```

## Testing / Pruebas

```bash
# unit tests / pruebas unitarias
$ npm run test

# e2e tests / pruebas e2e
$ npm run test:e2e

# test coverage / cobertura de pruebas
$ npm run test:cov
```

## Swagger Documentation / Documentación Swagger

Swagger documentation is available at `/api/docs` when running in non-production environments.
La documentación Swagger está disponible en `/api/docs` cuando se ejecuta en entornos no productivos.

## Admin User Creation / Creación de Usuario Admin

On the first run, the application will check if an admin user exists. If not, it will create one using the `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables.
En la primera ejecución, la aplicación verificará si existe un usuario administrador. Si no, creará uno utilizando las variables de entorno `ADMIN_USERNAME` y `ADMIN_PASSWORD`.

## License / Licencia

This project is [MIT licensed](LICENSE).
Este proyecto está bajo la licencia [MIT](LICENSE).
