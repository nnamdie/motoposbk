import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { Business } from '../business/entities/business.entity';
import { Member } from '../auth/entities/member.entity';
import { ExpenseController } from './controllers/expense.controller';
import { Expense } from './entities/expense.entity';
import { ExpenseService } from './services/expense.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Expense,
      Business,
      Member,
    ]),
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
