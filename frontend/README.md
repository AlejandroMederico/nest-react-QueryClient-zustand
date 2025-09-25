# Urbano Frontend (React + CRACO + Tailwind)

Panel de administración React (CRA) con **CRACO**, **TailwindCSS**, **React Query** y **Zustand**. Este README está optimizado para correr en desarrollo, construir para producción y destrabar errores comunes de build.

## 🚀 Stack

- React 17 + react-scripts 5 (CRA)
- CRACO para extender configuración sin `eject`
- TailwindCSS + PostCSS + Autoprefixer
- React Router v5, React Query v3, Zustand
- Axios como cliente HTTP

## ✅ Requisitos

- Node.js 18 LTS o 20 LTS
- Yarn 1.x (classic) o npm

> Consejo: usa **nvm** para alternar versiones de Node rápidamente.

## 📦 Instalación

```bash
# en la carpeta frontend/
yarn install
```

## 🔧 Desarrollo

```bash
yarn start
```

- App en `http://localhost:3000`
- Proxy de desarrollo a backend: `http://localhost:5000` (definido en `package.json`), así puedes llamar `/api/...` sin CORS ni variables adicionales.

## 🏗️ Build de producción

```bash
yarn build
```

Genera la carpeta `build/` lista para servir detrás de Nginx/Apache o como artefacto de Docker.

## 🧪 Tests

```bash
yarn test
```

## 📜 Scripts disponibles

```json
{
  "start": "craco start",
  "build": "craco build",
  "test": "craco test",
  "eject": "craco eject"
}
```

> CRACO permite personalizar Webpack/Babel/PostCSS sin hacer `eject`.

## 🧰 Lint/Format (opcional)

Este proyecto incluye ESLint con `simple-import-sort` y integración con Prettier.
Sugerido:

```bash
# ejemplo para formatear todo
npx prettier --write "src/**/*.{ts,tsx,js,jsx,css,scss,json,md}"
```

## 🌬️ Tailwind

Tailwind 3 está instalado con PostCSS y Autoprefixer. Asegúrate de tener los archivos de config (`tailwind.config.js` y `postcss.config.js`) y de importar los estilos de Tailwind en tu `index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🔌 Variables y configuración

- **Proxy**: definido en `package.json` -> `http://localhost:5000`.
- **Rutas API**: idealmente usa un cliente HTTP central con `baseURL` `/api` para que el proxy las redirija al backend.

## 🐳 Docker (opcional rápido)

Si deseas dockerizar sólo el frontend en modo producción:

1. Construye la app

```bash
yarn build
```

2. Usa una imagen de Nginx para servir `build/`. Ejemplo de `Dockerfile` mínimo:

```dockerfile
FROM nginx:alpine
COPY build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
```

3. Ejecuta:

```bash
docker build -t urbano-frontend .
docker run -p 8080:80 urbano-frontend
```

App en `http://localhost:8080`.

> Si vas a usar **docker-compose** con backend y base, configura el **reverse proxy** o el **service name** del backend y elimina el `proxy` de CRA (sólo para prod).

## 🩹 Solución de problemas

### 1) `Input is not a constructor` al hacer `yarn build`

Suele venir por cachés/artefactos viejos o desalineación de dependencias.
Pasos recomendados:

```bash
rm -rf node_modules
rm -f yarn.lock package-lock.json
# limpia el caché de la herramienta que uses
yarn cache clean || npm cache clean --force
yarn install
yarn build
```

Si persiste:

- Verifica que **CRACO** y **react-scripts** estén alineados (ya lo están en este proyecto).
- Mantén **TypeScript** en la versión del proyecto (4.9.5) y evita subirla sin revisar compatibilidad.
- Revisa plugins de PostCSS/Tailwind adicionales que no uses y elimínalos.

### 2) El frontend no ve el backend en dev

- Asegúrate de que el backend esté en `http://localhost:5000`.
- Usa rutas relativas a `/api` en axios/fetch y deja que CRA **proxy** redirija.
- Si usas cookies, habilita `withCredentials` en axios y configura CORS en el backend.

### 3) Recargas o fetchs muy frecuentes

- Centraliza la data con **React Query** o **Zustand** y define `staleTime`/`cacheTime` para evitar refetchs.
- Evita hacer polling cada pocos segundos salvo que sea necesario.

## 📁 Estructura sugerida (orientativa)

```
src/
  api/              # cliente axios + hooks de datos
  components/       # UI compartida
  features/         # dominios (users, courses, content)
  store/            # Zustand stores
  pages/            # rutas
  routes/           # react-router config
  styles/           # tailwind.css, etc.
  utils/
```

## 🔒 Calidad y performance

- Evita re-fetch al cambiar filtros locales: filtra en memoria si ya tienes la lista cargada.
- Usa `React.memo`/`useMemo`/`useCallback` en tablas grandes.
- Activa `simple-import-sort` y corrige warnings de hooks (`exhaustive-deps`).

---

**Licencia**: MIT (ajusta según corresponda).
