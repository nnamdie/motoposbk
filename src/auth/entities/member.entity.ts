import {
  Collection,
  Entity,
  Enum,
  ManyToMany,
  ManyToOne,
  Property,
  Unique,
} from '@mikro-orm/core';

import { TenantEntity } from '@/business/entities/tenant.entity';

import { Business } from '../../business/entities/business.entity';
import { MemberStatus } from '../enums/member-status.enum';
import { Permission } from './permission.entity';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity({ tableName: 'members' })
@Unique({ properties: ['business', 'user'] })
export class Member extends TenantEntity {
  @ManyToOne(() => User, { eager: true })
  user!: User;

  @ManyToOne(() => Business)
  business!: Business;

  @Property({ type: 'varchar', length: 100, nullable: true })
  position?: string;

  @Enum({ items: () => MemberStatus, default: MemberStatus.ACTIVE })
  status: MemberStatus = MemberStatus.ACTIVE;

  @Property({ type: 'boolean', default: false })
  isOwner: boolean = false;

  @Property({ type: 'timestamptz', nullable: true })
  joinedAt?: Date;

  @Property({ type: 'timestamptz', nullable: true })
  leftAt?: Date;

  @ManyToMany(() => Role)
  roles = new Collection<Role>(this);

  @ManyToMany(() => Permission)
  directPermissions = new Collection<Permission>(this);

  @Property({ type: 'json', nullable: true })
  settings?: Record<string, any>;
}
