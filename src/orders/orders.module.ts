import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { Business } from '../business/entities/business.entity';
import { Item } from '../inventory/entities/item.entity';
import { Reservation } from '../inventory/entities/reservation.entity';
import { OrdersController } from './controllers/orders.controller';
import { Customer } from './entities/customer.entity';
import { Invoice } from './entities/invoice.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from './entities/payment.entity';
import { PaymentSchedule } from './entities/payment-schedule.entity';
import { paymentProviderFactory } from './factories/payment-provider.factory';
import { OrdersService } from './services/orders.service';
import { PaymentProviderService } from './services/payment-provider.service';
import { PaymentScheduleService } from './services/payment-schedule.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Customer,
      Order,
      OrderItem,
      Invoice,
      Payment,
      PaymentSchedule,
      Item,
      Reservation,
      Business,
    ]),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    PaymentProviderService,
    PaymentScheduleService,
    paymentProviderFactory,
  ],
  exports: [OrdersService, PaymentProviderService],
})
export class OrdersModule {}
