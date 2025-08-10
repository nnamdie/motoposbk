import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

import { InstallmentFrequency } from '../enums/installment-frequency.enum';

export class CreatePaymentScheduleRequestDto {
  @ApiProperty({
    description: 'Total amount to be paid in installments (in kobo)',
    example: 100000000,
  })
  @IsNumber()
  @Min(1)
  totalAmount!: number;

  @ApiProperty({
    description: 'Down payment amount (in kobo)',
    example: 25000000,
  })
  @IsNumber()
  @Min(0)
  downPaymentAmount!: number;

  @ApiProperty({
    description: 'Installment frequency',
    enum: InstallmentFrequency,
    example: InstallmentFrequency.WEEKLY,
  })
  @IsEnum(InstallmentFrequency)
  frequency!: InstallmentFrequency;

  @ApiPropertyOptional({
    description: 'Number of installments (auto-calculated if not provided)',
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfInstallments?: number;

  @ApiPropertyOptional({
    description: 'Schedule start date (defaults to today)',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;
}
