import { Entity, PrimaryKey, Property, ManyToOne, Index } from '@mikro-orm/core';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';
import { Business } from '../../business/entities/business.entity';

@Entity()
@Index({ properties: ['phone', 'business', 'isUsed'] })
@Index({ properties: ['otpCode', 'phone', 'business'] })
export class AuthOtp extends BaseEntity {
  @Property({ length: 6 })
  otpCode!: string;

  @Property({ length: 20 })
  phone!: string;

  @ManyToOne(() => Business)
  business!: Business;

  @ManyToOne(() => User, { nullable: true })
  user?: User;

  @Property({ default: false })
  isUsed: boolean = false;

  @Property({ default: false })
  isExpired: boolean = false;

  @Property()
  expiresAt!: Date;

  @Property({ default: 0 })
  attempts: number = 0;

  @Property({ default: 3 })
  maxAttempts: number = 3;
}
