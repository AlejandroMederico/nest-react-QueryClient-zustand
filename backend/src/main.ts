import { ValidationPipe } from '@nestjs/common';
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
const RAW_ORIGINS = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

/* =========================
   Helpers “mini”
   ========================= */
function corsOrigin(
  origin: string | undefined,
  cb: (err: Error | null, ok?: boolean) => void,
) {
  // CLI / tools y same-origin (Swagger)
  if (!origin || origin === `http://localhost:${PORT}`) return cb(null, true);
  if (RAW_ORIGINS.length === 0 || RAW_ORIGINS.includes(origin))
    return cb(null, true);
  return cb(new Error('CORS: Origin not allowed'), false);
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

  // Middlewares
  app.use(cookieParser(COOKIE_SECRET));
  app.use(helmet());
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

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
