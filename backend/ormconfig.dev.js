/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config({ path: __dirname + '/.env' });
module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  cli: { migrationsDir: 'src/migrations' },
  synchronize: false,
};
