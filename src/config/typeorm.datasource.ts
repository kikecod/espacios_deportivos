import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { join } from 'path';

loadEnv({ path: '.env' });

const projectRoot = process.cwd();
const entitiesPath = join(projectRoot, 'src', '**/*.entity.{ts,js}');
const migrationsPath = join(projectRoot, 'src', 'migrations', '*.{ts,js}');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '123456',
  database: process.env.DB_NAME ?? 'espacios_deportivos',
  entities: [entitiesPath],
  migrations: [migrationsPath],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true' || process.env.NODE_ENV === 'development',
  migrationsRun: false,
});

export default AppDataSource;
