import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core';

import { TenantEntity } from '@/business/entities/tenant.entity';

import { User } from '../../auth/entities/user.entity';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';
import { Customer } from './customer.entity';
import { Invoice } from './invoice.entity';

@Entity({ tableName: 'payments' })
@Unique({ properties: ['business', 'paymentNumber'] })
@Unique({ properties: ['business', 'externalReference'] })
export class Payment extends TenantEntity {
  @Property({ type: 'varchar', length: 50 })
  paymentNumber!: string; // Auto-generated unique payment number

  @ManyToOne(() => Invoice)
  invoice!: Invoice;

  @ManyToOne(() => Customer)
  customer!: Customer;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Property({ type: 'varchar', length: 10, default: 'NGN' })
  currency: string = 'NGN';

  @Enum({ items: () => PaymentMethod })
  method!: PaymentMethod;

  @Enum({ items: () => PaymentType, default: PaymentType.ONE_TIME })
  type: PaymentType = PaymentType.ONE_TIME;

  @Enum({ items: () => PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus = PaymentStatus.PENDING;

  @Property({ type: 'varchar', length: 100, nullable: true })
  externalReference?: string; // Payment provider reference

  @Property({ type: 'varchar', length: 100, nullable: true })
  providerTransactionId?: string; // Provider's transaction ID

  @Property({ type: 'varchar', length: 50, nullable: true })
  provider?: string; // paystack, flutterwave, etc.

  @Property({ type: 'text', nullable: true })
  providerResponse?: string; // JSON response from provider

  // Bank transfer details (for bank transfer payments)
  @Property({ type: 'varchar', length: 100, nullable: true })
  bankName?: string;

  @Property({ type: 'varchar', length: 20, nullable: true })
  accountNumber?: string;

  @Property({ type: 'varchar', length: 100, nullable: true })
  accountName?: string;

  @Property({ type: 'timestamptz', nullable: true })
  bankDetailsExpiryDate?: Date;

  @Property({ type: 'varchar', length: 100, nullable: true })
  reference?: string; // Customer reference

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Property({ type: 'timestamptz', nullable: true })
  paidAt?: Date; // When payment was completed

  @Property({ type: 'timestamptz', nullable: true })
  failedAt?: Date; // When payment failed

  @Property({ type: 'text', nullable: true })
  failureReason?: string;

  @Property({ type: 'timestamptz', nullable: true })
  refundedAt?: Date; // When payment was refunded

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundedAmount: number = 0;

  @ManyToOne(() => User, { nullable: true })
  refundedBy?: User;

  @Property({ type: 'text', nullable: true })
  refundReason?: string;

  @ManyToOne(() => User)
  createdBy!: User;

  /**
   * Check if payment is successful
   */
  get isSuccessful(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  /**
   * Check if payment failed
   */
  get isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  /**
   * Check if payment is refunded
   */
  get isRefunded(): boolean {
    return this.refundedAmount > 0;
  }

  /**
   * Get remaining refundable amount
   */
  get refundableAmount(): number {
    return this.isSuccessful ? this.amount - this.refundedAmount : 0;
  }

  constructor(data?: Partial<Payment>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
