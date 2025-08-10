import {
  Collection,
  Entity,
  Enum,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';

import { TenantEntity } from '../../common/entities/base.entity';
import { ItemStatus } from '../enums/item-status.enum';
import { ItemAttribute } from './item-attribute.entity';
import { Reservation } from './reservation.entity';
import { StockEntry } from './stock-entry.entity';

@Entity({ tableName: 'items' })
@Unique({ properties: ['businessId', 'sku'] })
export class Item extends TenantEntity {
  @Property({ type: 'varchar', length: 50 })
  sku!: string; // Auto-generated based on item properties

  @Property({ type: 'varchar', length: 255 })
  name!: string;

  @Property({ type: 'varchar', length: 100, nullable: true })
  modelNo?: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Property({ type: 'varchar', length: 100, nullable: true })
  brand?: string;

  @Property({ type: 'json', nullable: true })
  images?: string[]; // Array of S3 URLs

  @OneToMany(() => ItemAttribute, (attribute) => attribute.item)
  attributes = new Collection<ItemAttribute>(this);

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  costPrice!: number; // Purchase price in kobo/cents

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  sellingPrice!: number; // Selling price in kobo/cents

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountPrice?: number; // Discounted price in kobo/cents

  @Property({ type: 'varchar', length: 10, default: 'NGN' })
  currency: string = 'NGN';

  @Property({ type: 'varchar', length: 20, nullable: true })
  unit?: string; // kg, pcs, liters, etc.

  @Property({ type: 'int', default: 0 })
  totalStock: number = 0; // Physical stock quantity

  @Property({ type: 'int', default: 0 })
  reservedStock: number = 0; // Stock reserved for pre-orders

  @Property({ type: 'int', default: 0 })
  minimumStock: number = 0; // Reorder level

  @Enum({ items: () => ItemStatus, default: ItemStatus.ACTIVE })
  status: ItemStatus = ItemStatus.ACTIVE;

  @Property({ type: 'boolean', default: true })
  trackStock: boolean = true; // Whether to track inventory for this item

  @Property({ type: 'boolean', default: false })
  allowPreOrder: boolean = false; // Allow pre-orders when out of stock

  @Property({ type: 'varchar', length: 100, nullable: true })
  barcode?: string;

  @OneToMany(() => StockEntry, (stockEntry) => stockEntry.item)
  stockEntries = new Collection<StockEntry>(this);

  @OneToMany(() => Reservation, (reservation) => reservation.item)
  reservations = new Collection<Reservation>(this);

  /**
   * Get available stock (total - reserved)
   */
  get availableStock(): number {
    return Math.max(0, this.totalStock - this.reservedStock);
  }

  /**
   * Check if item is in stock
   */
  get inStock(): boolean {
    return this.availableStock > 0;
  }

  /**
   * Check if item is low stock
   */
  get isLowStock(): boolean {
    return this.totalStock <= this.minimumStock && this.minimumStock > 0;
  }

  /**
   * Check if item can be ordered (in stock or pre-order allowed)
   */
  get canOrder(): boolean {
    return this.inStock || this.allowPreOrder;
  }
}
