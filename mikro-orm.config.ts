import { defineConfig } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

export default defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  dbName: process.env.DB_DATABASE || 'multi_tenant_epos',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  metadataProvider: TsMorphMetadataProvider,
  debug: process.env.NODE_ENV === 'development',
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
  },
  discovery: {
    warnWhenNoEntities: false,
  },
}); 