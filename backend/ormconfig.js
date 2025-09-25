module.exports = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  migrationsRun: true,
  logging: ['warn', 'error'],
  maxQueryExecutionTime: 100,
  extra: {
    max: Number(process.env.DB_POOL_MAX ?? 20),
    statement_timeout: Number(process.env.DB_STMT_MS ?? 0),
  },
};
