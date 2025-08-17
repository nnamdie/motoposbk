import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';

import { ExpenseCategory } from '../enums/expense-category.enum';

export class CreateExpenseRequestDto {
  @ApiProperty({
    description: 'Amount of the expense in kobo/cents',
    example: 500000, // 5000 NGN in kobo
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(1, { message: 'Amount must be greater than 0' })
  amount!: number;

  @ApiProperty({
    description: 'Reason/description for the expense',
    example: 'Transportation expenses for Q1 2024',
    maxLength: 1000,
  })
  @IsNotEmpty({ message: 'Notes is required' })
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(1000, { message: 'Notes cannot exceed 1000 characters' })
  notes!: string;

  @ApiPropertyOptional({
    description: 'Category of the expense',
    enum: ExpenseCategory,
    example: ExpenseCategory.TRANSPORTATION,
  })
  @IsOptional()
  @IsEnum(ExpenseCategory, { message: 'Invalid expense category' })
  category?: ExpenseCategory;
}
