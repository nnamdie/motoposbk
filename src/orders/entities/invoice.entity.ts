import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';

import { TenantEntity } from '@/business/entities/tenant.entity';

import { User } from '../../auth/entities/user.entity';
import { InvoiceStatus } from '../enums/invoice-status.enum';
import { InvoiceType } from '../enums/invoice-type.enum';
import { Customer } from './customer.entity';
import { Order } from './order.entity';
import { Payment } from './payment.entity';
import { PaymentSchedule } from './payment-schedule.entity';

@Entity({ tableName: 'invoices' })
@Unique({ properties: ['business', 'invoiceNumber'] })
export class Invoice extends TenantEntity {
  @Property({ type: 'varchar', length: 50 })
  invoiceNumber!: string; // Auto-generated unique invoice number

  @ManyToOne(() => Order)
  order!: Order;

  @ManyToOne(() => Customer)
  customer!: Customer;

  @Enum({ items: () => InvoiceType, default: InvoiceType.STANDARD })
  type: InvoiceType = InvoiceType.STANDARD;

  @Enum({ items: () => InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus = InvoiceStatus.DRAFT;

  @Property({ type: 'date' })
  issueDate!: Date;

  @Property({ type: 'date' })
  dueDate!: Date;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingAmount: number = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  total!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  balanceAmount!: number; // total - paidAmount

  @Property({ type: 'varchar', length: 10, default: 'NGN' })
  currency: string = 'NGN';

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Property({ type: 'text', nullable: true })
  terms?: string; // Payment terms

  @Property({ type: 'timestamptz', nullable: true })
  sentAt?: Date; // When invoice was sent to customer

  @Property({ type: 'timestamptz', nullable: true })
  paidAt?: Date; // When invoice was fully paid

  @Property({ type: 'timestamptz', nullable: true })
  voidedAt?: Date; // When invoice was voided

  @ManyToOne(() => User, { nullable: true })
  voidedBy?: User;

  @Property({ type: 'text', nullable: true })
  voidReason?: string;

  @ManyToOne(() => User)
  createdBy!: User;

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments = new Collection<Payment>(this);

  @OneToMany(() => PaymentSchedule, (schedule) => schedule.invoice)
  paymentSchedules = new Collection<PaymentSchedule>(this);

  /**
   * Check if invoice is fully paid
   */
  get isFullyPaid(): boolean {
    return this.paidAmount >= this.total;
  }

  /**
   * Check if invoice is overdue
   */
  get isOverdue(): boolean {
    return (
      new Date() > this.dueDate &&
      !this.isFullyPaid &&
      this.status === InvoiceStatus.SENT
    );
  }

  /**
   * Check if invoice can be voided
   */
  get canBeVoided(): boolean {
    return (
      [InvoiceStatus.DRAFT, InvoiceStatus.SENT].includes(this.status) &&
      this.paidAmount === 0
    );
  }

  constructor(data?: Partial<Invoice>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
