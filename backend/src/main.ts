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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  app.use(cookieParser(process.env.COOKIE_SECRET ?? ''));
  app.use(helmet());
  app.enableCors({
    origin: (origin, cb) => {
      const origins = (process.env.CORS_ORIGINS ?? '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      // permite CLI y same-origin (Swagger en :5000)
      if (
        !origin ||
        origin === `http://localhost:${process.env.PORT ?? 5000}`
      ) {
        return cb(null, true);
      }
      if (origins.length === 0 || origins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error('CORS: Origin not allowed'), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Carna Project API')
      .setDescription('Carna Project API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);
  }

  await createAdminOnFirstUse();

  const port = Number(process.env.PORT ?? 5000);
  const server: Server = await app.listen(port);
  const shutdown = async (sig: string) => {
    try {
      await app.close();
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 5000);
    } catch {
      process.exit(1);
    }
  };
  ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGUSR2'].forEach((sig) =>
    process.on(sig as NodeJS.Signals, () => shutdown(sig)),
  );
}
// al final de main.ts
if (require.main === module) {
  bootstrap();
}
