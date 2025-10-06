import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { CourseModule } from './course/course.module';
import { HealthModule } from './health/health.module';
import { StatsModule } from './stats/stats.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'shared', 'upload'),
      serveRoot: '/shared/upload',
    }),
    UserModule,
    AuthModule,
    CourseModule,
    ContentModule,
    StatsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
