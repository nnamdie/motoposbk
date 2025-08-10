import {
  MikroOrmModuleOptions,
  MikroOrmOptionsFactory,
} from '@mikro-orm/nestjs';
import { defineConfig } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfig implements MikroOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createMikroOrmOptions(): MikroOrmModuleOptions {
    return defineConfig({
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      user: this.configService.get('DB_USERNAME', 'postgres'),
      password: this.configService.get('DB_PASSWORD', 'password'),
      dbName: this.configService.get('DB_DATABASE', 'multi_tenant_epos'),
      entities: ['dist/**/*.entity.js'],
      entitiesTs: ['src/**/*.entity.ts'],
      debug: false,
      migrations: {
        path: './dist/migrations',
        pathTs: './src/migrations',
      },
      discovery: {
        warnWhenNoEntities: false,
        requireEntitiesArray: false,
        alwaysAnalyseProperties: false,
      },
    });
  }
}
