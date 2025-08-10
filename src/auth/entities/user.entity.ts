import {
  BeforeCreate,
  Collection,
  Entity,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';

import { BaseEntity } from '../../common/entities/base.entity';
import { Member } from './member.entity';

@Entity({ tableName: 'users' })
@Unique({ properties: ['phone'] })
export class User extends BaseEntity {
  @Property({ type: 'varchar', length: 100 })
  firstName!: string;

  @Property({ type: 'varchar', length: 100 })
  lastName!: string;

  @Property({ type: 'varchar', length: 20 })
  phone!: string; // Primary identifier - Nigerian phone format

  @Property({ type: 'varchar', length: 255, hidden: true })
  password!: string;

  @Property({ type: 'boolean', default: true })
  isActive: boolean = true;

  @Property({ type: 'boolean', default: false })
  phoneVerified: boolean = false;

  @Property({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Property({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Property({ type: 'json', nullable: true })
  preferences?: Record<string, any>;

  @OneToMany(() => Member, (member) => member.user)
  memberships = new Collection<Member>(this);

  @BeforeCreate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
