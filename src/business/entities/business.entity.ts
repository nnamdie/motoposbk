import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core';

import { User } from '../../auth/entities/user.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { BusinessStatus } from '../enums/business-status.enum';

// Re-export BusinessStatus for convenience
export { BusinessStatus };

@Entity({ tableName: 'businesses' })
@Unique({ properties: ['ggId'] })
@Unique({ properties: ['phone'] })
export class Business extends BaseEntity {
  @Property({ type: 'varchar', length: 6 })
  ggId!: string; // Auto-generated business ID

  @Property({ type: 'varchar', length: 255 })
  name!: string;

  @Property({ type: 'varchar', length: 20 })
  phone!: string; // Primary contact - Nigerian phone format

  @Property({ type: 'text', nullable: true })
  address?: string;

  @Property({ type: 'varchar', length: 100, nullable: true })
  industry?: string;

  @Enum({ items: () => BusinessStatus, default: BusinessStatus.PENDING })
  status: BusinessStatus = BusinessStatus.PENDING;

  @Property({ type: 'text', nullable: true })
  logo?: string;

  @Property({ type: 'text', nullable: true })
  banner?: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ type: 'json', nullable: true })
  settings?: Record<string, any>;

  @Property({ type: 'timestamptz', nullable: true })
  approvedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  approvedBy?: User;
}
