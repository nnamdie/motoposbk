import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';

import { TenantEntity } from '@/business/entities/tenant.entity';

import { User } from '../../auth/entities/user.entity';
import { StockEntryStatus } from '../enums/stock-entry-status.enum';
import { StockEntryType } from '../enums/stock-entry-type.enum';
import { Item } from './item.entity';

@Entity({ tableName: 'stock_entries' })
export class StockEntry extends TenantEntity {
  @ManyToOne(() => Item)
  item!: Item;

  @Enum({ items: () => StockEntryType })
  type!: StockEntryType;

  @Property({ type: 'int' })
  quantity!: number; // Can be negative for reductions

  @Property({ type: 'int' })
  previousStock!: number; // Stock before this entry

  @Property({ type: 'int' })
  newStock!: number; // Stock after this entry

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost?: number; // Cost per unit for incoming stock

  @Property({ type: 'varchar', length: 255, nullable: true })
  reference?: string; // PO number, invoice number, etc.

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Enum({ items: () => StockEntryStatus, default: StockEntryStatus.PENDING })
  status: StockEntryStatus = StockEntryStatus.PENDING;

  @ManyToOne(() => User, { nullable: true })
  processedBy?: User;

  @Property({ type: 'timestamptz', nullable: true })
  processedAt?: Date;

  @Property({ type: 'varchar', length: 100, nullable: true })
  supplier?: string; // For incoming stock

  @Property({ type: 'timestamptz', nullable: true })
  expiryDate?: Date; // For perishable items

  @Property({ type: 'varchar', length: 50, nullable: true })
  batchNumber?: string; // For batch tracking

  /**
   * Get the stock movement direction
   */
  get isIncrease(): boolean {
    return this.quantity > 0;
  }

  /**
   * Get the absolute quantity
   */
  get absoluteQuantity(): number {
    return Math.abs(this.quantity);
  }
}
