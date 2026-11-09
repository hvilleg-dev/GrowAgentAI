import { DataSource } from 'typeorm';
import {
  Usuario,
  Sesion,
  Mensaje,
  Incrustacion,
  AlertaCrisis,
  CostePorProveedor,
  ConfiguracionSistema,
  Goal
} from './entities';

const isDev = process.env.NODE_ENV === 'development';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    Usuario,
    Sesion,
    Mensaje,
    Incrustacion,
    AlertaCrisis,
    CostePorProveedor,
    ConfiguracionSistema,
    Goal
  ],
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migraciones_typeorm',
  synchronize: true,
  logging: isDev ? ['query', 'error'] : ['error'],
  logger: 'simple-console',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  poolSize: 10,
  maxQueryExecutionTime: 30000
});

export async function initializeDatabase(): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database initialized');

      if (isDev || process.env.NODE_ENV === 'production') {
        console.log('🔄 Synchronizing database schema...');
        await AppDataSource.synchronize();
        console.log('✅ Schema synchronized');
      }
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  }
}
