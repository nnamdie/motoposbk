import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core';

import { TenantEntity } from '../../common/entities/base.entity';
import { Item } from './item.entity';

@Entity({ tableName: 'item_attributes' })
@Unique({ properties: ['item', 'name'] }) // Prevent duplicate attribute names per item
export class ItemAttribute extends TenantEntity {
  @Property({ length: 100 })
  name!: string;

  @Property({ type: 'text' })
  value!: string;

  @Property({ length: 50, nullable: true })
  dataType?: 'string' | 'number' | 'boolean' | 'date';

  @Property({ nullable: true })
  displayOrder?: number;

  @Property({ default: true })
  isActive!: boolean;

  @ManyToOne(() => Item, { onDelete: 'cascade' })
  item!: Item;

  constructor(data?: Partial<ItemAttribute>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}
