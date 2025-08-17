import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';

import { TenantEntity } from '@/business/entities/tenant.entity';

import { Member } from '../../auth/entities/member.entity';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { ExpenseStatus } from '../enums/expense-status.enum';

@Entity({ tableName: 'expenses' })
export class Expense extends TenantEntity {
  @Property({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number; // Amount in kobo/cents

  @Property({ type: 'varchar', length: 10, default: 'NGN' })
  currency: string = 'NGN';

  @Property({ type: 'text' })
  notes!: string; // Description of the expense

  @Enum({ items: () => ExpenseCategory, default: ExpenseCategory.OTHER })
  category: ExpenseCategory = ExpenseCategory.OTHER;

  @Enum({ items: () => ExpenseStatus, default: ExpenseStatus.PENDING })
  status: ExpenseStatus = ExpenseStatus.PENDING;

  @Property({ type: 'timestamptz', nullable: true })
  approvedAt?: Date;

  @Property({ type: 'timestamptz', nullable: true })
  rejectedAt?: Date;

  @Property({ type: 'text', nullable: true })
  rejectionReason?: string; // Reason for rejection if applicable

  // Relationships
  @ManyToOne(() => Member, { eager: true })
  requester!: Member; // Member who created the expense request

  @ManyToOne(() => Member, { nullable: true })
  approver?: Member; // Member who approved/rejected the expense
}
