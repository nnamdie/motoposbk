import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { CommonModule } from './common/common.module';
import { DatabaseConfig } from './config/database.config';
import { ExpenseModule } from './expenses/expense.module';
import { HealthModule } from './health/health.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MikroOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // Feature modules
    CommonModule,
    HealthModule,
    AuthModule,
    BusinessModule,
    ExpenseModule,
    InventoryModule,
    OrdersModule,
  ],
  providers: [AppService],
})
export class AppModule {}
