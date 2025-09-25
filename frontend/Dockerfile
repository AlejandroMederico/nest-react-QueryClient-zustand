# Puedes cambiar las bases con --build-arg BASE_NODE=... y BASE_NGINX=...
ARG BASE_NODE=public.ecr.aws/docker/library/node:18-alpine
ARG BASE_NGINX=public.ecr.aws/docker/library/nginx:1.25.5-alpine

# ---------- Stage 1: Build ----------
FROM ${BASE_NODE} AS builder
WORKDIR /app
ENV CI=true

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# ---------- Stage 2: Serve ----------
FROM ${BASE_NGINX}

# Nginx para SPA + proxy a urbano-api
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el build generado en el stage anterior
COPY --from=builder /app/build /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
