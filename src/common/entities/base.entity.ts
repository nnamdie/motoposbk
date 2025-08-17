import {
  BeforeCreate,
  BeforeUpdate,
  Entity,
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
