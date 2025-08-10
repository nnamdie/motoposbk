import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core';

import { User } from '../../auth/entities/user.entity';
import { TenantEntity } from '../../common/entities/base.entity';
import { ScheduleStatus } from '../enums/schedule-status.enum';
import { Invoice } from './invoice.entity';

@Entity({ tableName: 'payment_schedules' })
@Unique({ properties: ['businessId', 'invoice', 'installmentNumber'] })
export class PaymentSchedule extends TenantEntity {
  @ManyToOne(() => Invoice, { onDelete: 'cascade' })
  invoice!: Invoice;

  @Property({ type: 'int' })
  invoiceId!: number;

  @Property({ type: 'int' })
  installmentNumber!: number; // 1, 2, 3, 4...

  @Property({ type: 'date' })
  dueDate!: Date;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amountDue!: number; // Original amount due for this installment

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number = 0; // Amount paid towards this installment

  @Property({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string = 'NGN';

  @Enum({ items: () => ScheduleStatus, default: ScheduleStatus.PENDING })
  status: ScheduleStatus = ScheduleStatus.PENDING;

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Property({ type: 'timestamptz', nullable: true })
  paidAt?: Date; // When this installment was fully paid

  @Property({ type: 'timestamptz', nullable: true })
  lastPaymentAt?: Date; // When last payment was made towards this installment

  @ManyToOne(() => User)
  createdBy!: User;

  // Simple getters for data access only
  get remainingBalance(): number {
    return this.amountDue - this.amountPaid;
  }

  get isFullyPaid(): boolean {
    return this.amountPaid >= this.amountDue;
  }

  get isPartiallyPaid(): boolean {
    return this.amountPaid > 0 && this.amountPaid < this.amountDue;
  }
}
