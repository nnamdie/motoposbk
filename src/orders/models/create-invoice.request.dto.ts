import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { InvoiceType } from '../enums/invoice-type.enum';

export class CreateInvoiceRequestDto {
  @ApiPropertyOptional({
    description: 'Invoice type',
    enum: InvoiceType,
    example: InvoiceType.STANDARD,
  })
  @IsOptional()
  @IsEnum(InvoiceType)
  type?: InvoiceType;

  @ApiProperty({
    description: 'Due date for payment',
    example: '2024-02-15T23:59:59.000Z',
  })
  @IsDateString()
  dueDate!: string;

  @ApiPropertyOptional({
    description: 'Custom tax amount (overrides calculated)',
    example: 7500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({
    description: 'Custom discount amount (overrides calculated)',
    example: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Custom shipping amount (overrides calculated)',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingAmount?: number;

  @ApiPropertyOptional({
    description: 'Invoice notes',
    example: 'Payment due within 30 days',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Payment terms',
    example: 'Net 30 days',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  terms?: string;
}
