Porque synchronize: true hace que TypeORM modifique el esquema automáticamente en cada arranque a partir de tus entidades. Eso puede ser cómodo en desarrollo, pero en producción trae varios riesgos serios:

Pérdida de datos accidental: si quitás/renombrás una columna o relación, TypeORM puede dropear columnas/índices/tablas para “encajar” el modelo.

Cambios no auditados: no hay historial ni revisión de qué alteró el esquema; es difícil reproducir o revertir.

Carreras entre instancias: con varias réplicas/Pods arrancando, cada una intenta migrar y podés terminar con locks/errores.

Cortes y locks: ALTERs pesados al iniciar la app → bloqueo de tablas y downtime.

Zero-downtime imposible: no podés orquestar cambios compatibles por pasos (ej. estrategia expand→migrate→contract).

Casos especiales fallan: ENUM, vistas, triggers, extensiones (Postgres) o cambios de tipos requieren pasos manuales; el auto-sync puede romperse.

Permisos: el usuario de DB en prod suele no tener privilegios DDL amplios; el sync falla al arrancar.

Por eso la práctica segura es synchronize: false + migraciones versionadas.

¿Qué hacer entonces?

Generá migraciones cuando cambies entidades:

npx typeorm migration:generate -d src/migrations -n add_users_fields

(o con CLI de Nest si lo tenés configurado).

Revisá el SQL de la migración (asegurá compatibilidad y datos).

Probalo en staging y luego aplicalo en prod:

npx typeorm migration:run

# y para revertir:

npx typeorm migration:revert

Opcional en entornos controlados: migrationsRun: true para que la app ejecute migraciones al iniciar (solo si ya las revisaste y no tenés múltiples instancias corriendo sin coordinación).

Config recomendado (ejemplo)
export default {
type: 'postgres',
host: process.env.DATABASE_HOST,
port: Number(process.env.DATABASE_PORT),
username: process.env.DATABASE_USERNAME,
password: process.env.DATABASE_PASSWORD,
database: process.env.DATABASE_NAME,
entities: ['dist/**/*.entity.js'],
synchronize: false, // ✅ nunca en prod
migrations: ['dist/migrations/*.js'],
migrationsTransactionMode: 'each', // transacción por migración
logging: ['warn', 'error'],
maxQueryExecutionTime: 100,
migrationsRun: false, // o true si decidís auto-aplicarlas
extra: {
max: Number(process.env.DB_POOL_MAX ?? 20),
statement_timeout: Number(process.env.DB_STMT_MS ?? 0),
},
} as const;

Tip rápido para desarrollo

En local podés usar synchronize: true solo para prototipar y luego:

congelar el estado actual generando una migración base (migration:generate),

volver a synchronize: false y seguir el flujo de migraciones.

Así evitás sorpresas y mantenés el esquema bajo control en el “Challenge Urbano” o cualquier despliegue serio.

¡Bien ahí, Alejandro! Tu config está casi lista para producción. Te dejo mejoras y por qué convienen:

Puntos clave a ajustar

autoLoadEntities vs entities: puedes usar ambos, pero no es necesario.

autoLoadEntities: true registra entidades que importes con TypeOrmModule.forFeature(...).

entities: ['dist/**/*.entity.js'] busca todo en dist. Si ya usas forFeature, podrías omitir entities. Si prefieres escanear todo, deja entities y quita autoLoadEntities.

Rutas de entidades/migraciones: en desarrollo (ts) y prod (js) cambian. Conviene condicionar por NODE_ENV.

CLI de TypeORM (v0.3+): usá un DataSource (por ejemplo datasource.ts) para migration:generate/run.

SSL en prod (Heroku/RDS/etc.): agrega ssl si tu proveedor lo requiere.

Naming strategy: usa snake_case para tablas/columnas (más estándar en Postgres).

migrationsRun: si quieres que aplique migraciones al iniciar (staging/servicios simples). En orquestadores con múltiples réplicas, mejor aplicarlas fuera de la app.

Parámetros numéricos: si la env viene vacía, Number('') es 0 y puede sorprender. Dale defaults seguros.

Timeouts: ya usas statement_timeout (servidor). Perfecto. maxQueryExecutionTime sólo loguea lento del lado de TypeORM.

Versión mejorada (Nest + TypeORM 0.3+)
// ormconfig.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const isProd = process.env.NODE_ENV === 'production';

const common: Omit<TypeOrmModuleOptions, 'type'> & Omit<DataSourceOptions, 'type'> = {
host: process.env.DATABASE_HOST ?? 'localhost',
port: Number(process.env.DATABASE_PORT ?? 5432),
username: process.env.DATABASE_USERNAME ?? 'postgres',
password: process.env.DATABASE_PASSWORD ?? 'postgres',
database: process.env.DATABASE_NAME ?? 'app',
// Elige UNO de estos enfoques:
// 1) Escanear todo (dist en prod, src en dev):
entities: [isProd ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
// 2) O automático via forFeature:
// autoLoadEntities: true,

synchronize: false, // nunca en prod
migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
migrationsTableName: 'typeorm_migrations',
migrationsRun: false, // ponlo en true SOLO si controlas el arranque y réplicas

namingStrategy: new SnakeNamingStrategy(),

logging: isProd ? ['warn', 'error'] : ['query', 'warn', 'error'],
maxQueryExecutionTime: isProd ? 100 : 0, // 0 = desactivado

extra: {
max: Number(process.env.DB_POOL_MAX ?? 20), // pool de conexiones
statement_timeout: Number(process.env.DB_STMT_MS ?? 0), // 0 = sin límite
application_name: process.env.APP_NAME ?? 'urbano-backend',
ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
},
};

const ormconfig: TypeOrmModuleOptions = {
type: 'postgres',
...common,
};

export default ormconfig;

// (opcional) datasource para CLI de migraciones:
export const dataSource = new DataSource({
type: 'postgres',
...common,
});

Uso con Nest
// app.module.ts
TypeOrmModule.forRoot(ormconfig),
// y si usas autoLoadEntities, registra en cada módulo:
// TypeOrmModule.forFeature([User, Post, ...])

CLI de migraciones (ejemplos)

# Generar (lee tus entidades actuales)

npx typeorm migration:generate -d src/migrations -n add_users_fields

# Ejecutar en la DB

npx typeorm migration:run

# Revertir la última
