import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { StockEntryType } from '../enums/stock-entry-type.enum';

export class AddStockRequestDto {
  @ApiProperty({ example: 'Incoming', enum: StockEntryType })
  @IsEnum(StockEntryType)
  type!: StockEntryType;

  @ApiProperty({
    example: 10,
    description: 'Quantity to add (positive) or remove (negative)',
  })
  @IsNumber()
  quantity!: number;

  @ApiProperty({
    example: 80000000,
    description: 'Unit cost in kobo for incoming stock',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @ApiProperty({ example: 'PO-2024-001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reference?: string;

  @ApiProperty({ example: 'Received from supplier ABC Ltd', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({ example: 'ABC Electronics Ltd', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  supplier?: string;

  @ApiProperty({ example: '2025-12-31T23:59:59.000Z', required: false })
  @IsOptional()
  @IsString()
  expiryDate?: string;

  @ApiProperty({ example: 'BATCH-2024-001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  batchNumber?: string;
}
