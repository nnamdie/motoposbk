import {
  Collection,
  Entity,
  ManyToMany,
  Property,
  Unique,
} from '@mikro-orm/core';

import { TenantEntity } from '../../common/entities/base.entity';
import { Member } from './member.entity';
import { Permission } from './permission.entity';

@Entity({ tableName: 'roles' })
@Unique({ properties: ['businessId', 'name'] })
export class Role extends TenantEntity {
  @Property({ type: 'varchar', length: 100 })
  name!: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Property({ type: 'boolean', default: true })
  isActive: boolean = true;

  @Property({ type: 'boolean', default: false })
  isSystem: boolean = false;

  @ManyToMany(() => Member, (member) => member.roles)
  members = new Collection<Member>(this);

  @ManyToMany(() => Permission, 'roles', { owner: true })
  permissions = new Collection<Permission>(this);

  @Property({ type: 'json', nullable: true })
  settings?: Record<string, any>;
}
