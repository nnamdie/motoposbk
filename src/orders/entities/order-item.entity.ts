import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { TenantEntity } from '../../common/entities/base.entity';
import { Item } from '../../inventory/entities/item.entity';
import { Order } from './order.entity';

@Entity({ tableName: 'order_items' })
export class OrderItem extends TenantEntity {
  @ManyToOne(() => Order)
  order!: Order;

  @Property({ type: 'int' })
  orderId!: number;

  @ManyToOne(() => Item)
  item!: Item;

  @Property({ type: 'int' })
  itemId!: number;

  @Property({ type: 'varchar', length: 50 })
  itemSku!: string; // Snapshot of SKU at time of order

  @Property({ type: 'varchar', length: 255 })
  itemName!: string; // Snapshot of name at time of order

  @Property({ type: 'int' })
  quantity!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number; // Price at time of order

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number = 0; // Discount applied to this line item

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  lineTotal!: number; // (quantity * unitPrice) - discountAmount

  @Property({ type: 'varchar', length: 10, default: 'NGN' })
  currency: string = 'NGN';

  @Property({ type: 'boolean', default: false })
  isPreOrder: boolean = false; // True if item was out of stock

  @Property({ type: 'int', default: 0 })
  reservedQuantity: number = 0; // Quantity reserved from inventory

  @Property({ type: 'int', default: 0 })
  fulfilledQuantity: number = 0; // Quantity actually allocated

  @Property({ type: 'text', nullable: true })
  notes?: string;

  /**
   * Get remaining quantity to fulfill
   */
  get remainingQuantity(): number {
    return Math.max(0, this.quantity - this.fulfilledQuantity);
  }

  /**
   * Check if order item is fully fulfilled
   */
  get isFullyFulfilled(): boolean {
    return this.fulfilledQuantity >= this.quantity;
  }

  constructor(data?: Partial<OrderItem>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
