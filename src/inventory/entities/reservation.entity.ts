import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';

import { TenantEntity } from '@/business/entities/tenant.entity';

import { User } from '../../auth/entities/user.entity';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { ReservationType } from '../enums/reservation-type.enum';
import { Item } from './item.entity';

@Entity({ tableName: 'reservations' })
export class Reservation extends TenantEntity {
  @ManyToOne(() => Item)
  item!: Item;

  @Property({ type: 'int' })
  quantity!: number; // Quantity reserved

  @Property({ type: 'int', default: 0 })
  fulfilledQuantity: number = 0; // Quantity actually allocated

  @Enum({ items: () => ReservationType, default: ReservationType.INTERNAL })
  type: ReservationType = ReservationType.INTERNAL;

  @Enum({ items: () => ReservationStatus, default: ReservationStatus.ACTIVE })
  status: ReservationStatus = ReservationStatus.ACTIVE;

  @Property({ type: 'varchar', length: 255, nullable: true })
  customerName?: string;

  @Property({ type: 'varchar', length: 20, nullable: true })
  customerPhone?: string;

  @Property({ type: 'varchar', length: 100, nullable: true })
  reference?: string; // Order reference, promotion code, etc.

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Property({ type: 'timestamptz', nullable: true })
  expectedDate?: Date; // When stock is expected

  @Property({ type: 'timestamptz', nullable: true })
  expiryDate?: Date; // When reservation expires

  @ManyToOne(() => User, { nullable: true })
  reservedBy?: User;

  @Property({ type: 'timestamptz', nullable: true })
  fulfilledAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  fulfilledBy?: User;

  /**
   * Get remaining quantity to fulfill
   */
  get remainingQuantity(): number {
    return Math.max(0, this.quantity - this.fulfilledQuantity);
  }

  /**
   * Check if reservation is fully fulfilled
   */
  get isFullyFulfilled(): boolean {
    return this.fulfilledQuantity >= this.quantity;
  }

  /**
   * Check if reservation is expired
   */
  get isExpired(): boolean {
    return this.expiryDate && this.expiryDate < new Date();
  }

  /**
   * Check if reservation can be fulfilled
   */
  get canFulfill(): boolean {
    return (
      this.status === ReservationStatus.ACTIVE &&
      !this.isExpired &&
      !this.isFullyFulfilled
    );
  }
}
