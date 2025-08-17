import {
  Collection,
  Entity,
  ManyToMany,
  Property,
  Unique,
} from '@mikro-orm/core';

import { TenantEntity } from '@/business/entities/tenant.entity';
import { Member } from './member.entity';
import { Permission } from './permission.entity';

@Entity({ tableName: 'roles' })
@Unique({ properties: ['business', 'name'] })
export class Role extends TenantEntity {
  @Property({ length: 100 })
  name!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ default: true })
  isActive!: boolean;

  @Property({ default: false })
  isSystem!: boolean;

  @ManyToMany(() => Member, (member) => member.roles)
  members = new Collection<Member>(this);

  @ManyToMany(() => Permission, (permission) => permission.roles)
  permissions = new Collection<Permission>(this);
}
