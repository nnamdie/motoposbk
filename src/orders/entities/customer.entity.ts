import {
  Collection,
  Entity,
  Enum,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';

import { TenantEntity } from '@/business/entities/tenant.entity';
import { Gender } from '../enums/gender.enum';

@Entity({ tableName: 'customers' })
@Unique({ properties: ['business', 'phone'] })
export class Customer extends TenantEntity {
  @Property({ type: 'varchar', length: 255 })
  firstName!: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  lastName?: string;

  @Property({ type: 'varchar', length: 20 })
  phone!: string; // Primary identifier (no email needed)

  @Property({ type: 'text', nullable: true })
  address?: string;

  @Property({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Property({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Property({ type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @Property({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Enum({ items: () => Gender, nullable: true })
  gender?: Gender;

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Property({ type: 'boolean', default: true })
  isActive: boolean = true;

  @OneToMany('Order', 'customer')
  orders = new Collection<any>(this);

  /**
   * Get customer's full name
   */
  get fullName(): string {
    return this.lastName
      ? `${this.firstName} ${this.lastName}`
      : this.firstName;
  }

  constructor(data?: Partial<Customer>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
