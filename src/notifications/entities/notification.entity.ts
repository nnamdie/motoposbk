import { Entity, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { User } from '../../auth/entities/user.entity';
import { TenantEntity } from '@/business/entities/tenant.entity';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationStatus } from '../enums/notification-status.enum';

@Entity()
export class Notification extends TenantEntity {
  @Property({ type: 'varchar', length: 255 })
  template!: string;

  @ManyToOne(() => User)
  receiver!: User;

  @Property({ type: 'json' })
  variables!: Record<string, any>;

  @Enum({ items: () => NotificationChannel })
  channel!: NotificationChannel;

  @Property({ type: 'timestamptz' })
  sendAt!: Date;

  @Property({ type: 'varchar', length: 255, nullable: true })
  externalId?: string;

  @Property({ type: 'timestamptz', nullable: true })
  sentAt?: Date;

  @Enum({ items: () => NotificationStatus })
  status: NotificationStatus = NotificationStatus.PENDING;

  @Property({ type: 'timestamptz', nullable: true })
  deliveredAt?: Date;

  @Property({ type: 'timestamptz', nullable: true })
  readAt?: Date;

  @Property({ type: 'text', nullable: true })
  errorMessage?: string;

  @Property({ type: 'int', default: 0 })
  retryCount: number = 0;

  @Property({ type: 'timestamptz', nullable: true })
  lastRetryAt?: Date;
}
