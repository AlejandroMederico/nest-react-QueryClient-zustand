import { ValidationPipe } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Server } from 'http';

import { AppModule } from './app.module';
import { Role } from './enums/role.enum';
import { User } from './user/user.entity';

/* =========================
   ENV/CONFIG (una sola vez)
   ========================= */
const PORT = Number(process.env.PORT ?? 5000);
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const COOKIE_SECRET = process.env.COOKIE_SECRET ?? '';

function parseAllowlist(env: string | undefined): Set<string> {
  const out = new Set<string>();
  if (!env) return out;
  for (const raw of env.split(',')) {
    const v = raw.trim();
    if (v) out.add(v);
  }
  return out;
}

function setupSwagger(app) {
  if (NODE_ENV === 'production') return;
  const cfg = new DocumentBuilder()
    .setTitle('Carna Project API')
    .setDescription('Carna Project API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, cfg);
  SwaggerModule.setup('/api/docs', app, doc);
}

async function createAdminOnFirstUse() {
  const admin = await User.findOne({ where: { username: 'admin' } });
  if (!admin) {
    await User.create({
      firstName: 'admin',
      lastName: 'admin',
      isActive: true,
      username: process.env.ADMIN_USERNAME,
      role: Role.Admin,
      password: await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        Number(process.env.BCRYPT_ROUNDS ?? 12),
      ),
    }).save();
  }
}

/* =========================
   Bootstrap
   ========================= */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  const isProd = process.env.NODE_ENV === 'production';
  const allowlist = parseAllowlist(process.env.CORS_ORIGINS);
  // En desarrollo, agrega localhost por defecto (además de CORS_ORIGINS)
  if (!isProd) {
    allowlist.add('http://localhost:3000');
    allowlist.add('http://127.0.0.1:3000');
  }

  // Middlewares
  app.use(cookieParser(COOKIE_SECRET || ''));
  app.use(helmet());

  // CORS
  const corsOptions: CorsOptions = {
    credentials: true, // si usas cookies (refresh)
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 204,
    origin: (origin, cb) => {
      // 1) Sin 'Origin' (curl, healthchecks, SSR, tests):
      if (!origin) {
        // permitir en DEV; en PROD lo podés poner en false si querés
        return cb(null, !isProd);
      }

      // 2) Si está en la allowlist → permitir
      if (allowlist.has(origin)) {
        return cb(null, true);
      }

      // 3) Si no está permitido → denegar SIN lanzar error (evita 500)
      return cb(null, false);
    },
  };

  app.enableCors(corsOptions);

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Docs
  setupSwagger(app);

  // Seed (igual que antes)
  await createAdminOnFirstUse();

  // Listen + shutdown limpio
  const server: Server = await app.listen(PORT);
  console.log(`[Carna] ${NODE_ENV} → http://localhost:${PORT}/api`);
  if (NODE_ENV !== 'production') {
    console.log(`Swagger → http://localhost:${PORT}/api/docs`);
  }

  const shutdown = async () => {
    try {
      await app.close();
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 5000);
    } catch {
      process.exit(1);
    }
  };
  ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGUSR2'].forEach((sig) =>
    process.on(sig as NodeJS.Signals, shutdown),
  );
  process.on('uncaughtException', shutdown);
  process.on('unhandledRejection', shutdown);
}

if (require.main === module) {
  bootstrap();
}
