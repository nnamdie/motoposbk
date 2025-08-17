import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ExpenseStatus } from '../enums/expense-status.enum';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { MemberResponseDto } from '@/auth/models/member-profile.response.dto';

export class ExpenseResponseDto {
  @ApiProperty({
    description: 'Expense ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Auto-generated reference number',
    example: 'EXP-2024-001',
  })
  reference?: string;

  @ApiProperty({
    description: 'Amount of the expense in kobo/cents',
    example: 500000,
  })
  amount!: number;

  @ApiProperty({
    description: 'Currency of the expense',
    example: 'NGN',
  })
  currency!: string;

  @ApiProperty({
    description: 'Reason/description for the expense',
    example: 'Transportation expenses for Q1 2024',
  })
  notes!: string;

  @ApiProperty({
    description: 'Category of the expense',
    enum: ExpenseCategory,
    example: ExpenseCategory.TRANSPORTATION,
  })
  category?: ExpenseCategory;

  @ApiProperty({
    description: 'Current status of the expense',
    enum: ExpenseStatus,
    example: ExpenseStatus.PENDING,
  })
  status!: ExpenseStatus;

  @ApiPropertyOptional({
    description: 'Date when the expense was approved',
    example: '2024-01-15T10:30:00.000Z',
  })
  approvedAt?: string;

  @ApiPropertyOptional({
    description: 'Date when the expense was rejected',
    example: '2024-01-15T10:30:00.000Z',
  })
  rejectedAt?: string;

  @ApiPropertyOptional({
    description: 'Reason for rejection if applicable',
    example: 'Insufficient budget allocation',
  })
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: 'Due date for the expense payment',
    example: '2024-03-31T23:59:59.000Z',
  })
  dueDate?: string;

  @ApiProperty({
    description: 'Member who created the expense request',
    type: MemberResponseDto,
  })
  requester!: MemberResponseDto;

  @ApiPropertyOptional({
    description: 'Member who approved/rejected the expense',
    type: MemberResponseDto,
  })
  approver?: MemberResponseDto;

  @ApiProperty({
    description: 'Date when the expense was created',
    example: '2024-01-10T09:00:00.000Z',
  })
  createdAt!: string;
}
