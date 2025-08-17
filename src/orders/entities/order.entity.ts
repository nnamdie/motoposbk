import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';

import { User } from '../../auth/entities/user.entity';
import { TenantEntity } from '@/business/entities/tenant.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderType } from '../enums/order-type.enum';
import { Customer } from './customer.entity';
import { Invoice } from './invoice.entity';
import { OrderItem } from './order-item.entity';

@Entity({ tableName: 'orders' })
@Unique({ properties: ['business', 'orderNumber'] })
export class Order extends TenantEntity {
  @Property({ type: 'varchar', length: 50 })
  orderNumber!: string; // Auto-generated unique order number

  @ManyToOne(() => Customer)
  customer!: Customer;

  @Enum({ items: () => OrderType, default: OrderType.REGULAR })
  type: OrderType = OrderType.REGULAR;

  @Enum({ items: () => OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus = OrderStatus.PENDING;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items = new Collection<OrderItem>(this);

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number; // Sum of all line items

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingAmount: number = 0;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  total!: number; // subtotal + tax + shipping - discount

  @Property({ type: 'varchar', length: 10, default: 'NGN' })
  currency: string = 'NGN';

  @Property({ type: 'boolean', default: false })
  isPreOrder: boolean = false; // True if any item is out of stock

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  deliveryAddress?: string;

  @Property({ type: 'timestamptz', nullable: true })
  expectedDeliveryDate?: Date;

  @Property({ type: 'timestamptz', nullable: true })
  deliveredAt?: Date;

  @Property({ type: 'timestamptz', nullable: true })
  cancelledAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  cancelledBy?: User;

  @Property({ type: 'text', nullable: true })
  cancellationReason?: string;

  @ManyToOne(() => User)
  createdBy!: User;

  @OneToMany(() => Invoice, (invoice) => invoice.order)
  invoices = new Collection<Invoice>(this);

  /**
   * Check if order can be cancelled
   */
  get canBeCancelled(): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(this.status);
  }

  /**
   * Check if order is completed
   */
  get isCompleted(): boolean {
    return this.status === OrderStatus.DELIVERED;
  }

  /**
   * Check if order is cancelled
   */
  get isCancelled(): boolean {
    return this.status === OrderStatus.CANCELLED;
  }

  constructor(data?: Partial<Order>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
