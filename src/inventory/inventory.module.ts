import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { Business } from '../business/entities/business.entity';
import { InventoryController } from './controllers/inventory.controller';
import { Item } from './entities/item.entity';
import { ItemAttribute } from './entities/item-attribute.entity';
import { Reservation } from './entities/reservation.entity';
import { StockEntry } from './entities/stock-entry.entity';
import { InventoryService } from './services/inventory.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Item,
      ItemAttribute,
      StockEntry,
      Reservation,
      Business,
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
