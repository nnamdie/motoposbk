import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { BusinessController } from './controllers/business.controller';
import { Business } from './entities/business.entity';
import { BusinessService } from './services/business.service';

@Module({
  imports: [MikroOrmModule.forFeature([Business])],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
