import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';

import { ExpenseStatus } from '../enums/expense-status.enum';

export class ApproveExpenseRequestDto {
  @ApiProperty({
    description: 'Action to take on the expense',
    enum: [ExpenseStatus.APPROVED, ExpenseStatus.REJECTED],
    example: ExpenseStatus.APPROVED,
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum([ExpenseStatus.APPROVED, ExpenseStatus.REJECTED], {
    message: 'Status must be either approved or rejected',
  })
  status!: ExpenseStatus;

  @ApiPropertyOptional({
    description: 'Reason for rejection (required if status is rejected)',
    example: 'Insufficient budget allocation for this quarter',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString({ message: 'Rejection reason must be a string' })
  @MaxLength(1000, { message: 'Rejection reason cannot exceed 1000 characters' })
  rejectionReason?: string;
}
