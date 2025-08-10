import {
  BeforeCreate,
  BeforeUpdate,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

@Entity({ abstract: true })
export abstract class BaseEntity {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property({ type: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @BeforeCreate()
  beforeCreate() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date();
  }
}

@Entity({ abstract: true })
export abstract class TenantEntity extends BaseEntity {
  @Property({ type: 'varchar', length: 6 })
  businessId!: string; // Keep as string since it's the business ggId (e.g., "ABC123")

  @ManyToOne(() => 'User', { nullable: true })
  createdBy?: any; // Using 'any' to avoid circular dependency - will be integer ID

  @ManyToOne(() => 'User', { nullable: true })
  updatedBy?: any; // Using 'any' to avoid circular dependency - will be integer ID
}
