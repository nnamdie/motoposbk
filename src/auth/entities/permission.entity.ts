import {
  Collection,
  Entity,
  Enum,
  ManyToMany,
  Property,
  Unique,
} from '@mikro-orm/core';

import { BaseEntity } from '../../common/entities/base.entity';
import { PermissionCategory } from '../enums/permission-category.enum';
import { Member } from './member.entity';
import { Role } from './role.entity';

@Entity({ tableName: 'permissions' })
@Unique({ properties: ['key'] })
export class Permission extends BaseEntity {
  @Property({ type: 'varchar', length: 100 })
  key!: string; // e.g., 'items.create', 'orders.manage'

  @Property({ type: 'varchar', length: 100 })
  name!: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Enum({
    items: () => PermissionCategory,
    default: PermissionCategory.BUSINESS,
  })
  category: PermissionCategory = PermissionCategory.BUSINESS;

  @Property({ type: 'boolean', default: true })
  isActive: boolean = true;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles = new Collection<Role>(this);

  @ManyToMany(() => Member, (member) => member.directPermissions)
  members = new Collection<Member>(this);
}
