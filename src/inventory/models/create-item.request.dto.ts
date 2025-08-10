import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { ItemAttributeRequestDto } from './item-attribute.request.dto';

export class CreateItemRequestDto {
  @ApiProperty({ example: 'Samsung Galaxy S24' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'SM-S921B', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  modelNo?: string;

  @ApiProperty({
    example: 'Latest Samsung flagship smartphone with advanced camera',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 'Electronics', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ example: 'Samsung', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiProperty({
    example: ['https://s3.example.com/image1.jpg'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    type: [ItemAttributeRequestDto],
    description: 'Item attributes',
    example: [
      { name: 'Color', value: 'Black', dataType: 'string', displayOrder: 1 },
      { name: 'Storage', value: '256GB', dataType: 'string', displayOrder: 2 },
      { name: 'Weight', value: '168', dataType: 'number', displayOrder: 3 },
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemAttributeRequestDto)
  attributes?: ItemAttributeRequestDto[];

  @ApiProperty({
    example: 80000000,
    description: 'Cost price in kobo (800,000 NGN)',
  })
  @IsNumber()
  @Min(0)
  costPrice!: number;

  @ApiProperty({
    example: 120000000,
    description: 'Selling price in kobo (1,200,000 NGN)',
  })
  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @ApiProperty({
    example: 110000000,
    description: 'Discount price in kobo',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;

  @ApiProperty({ example: 'pcs', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiProperty({
    example: 5,
    description: 'Minimum stock level for reorder alerts',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumStock?: number;

  @ApiProperty({
    example: true,
    description: 'Whether to track inventory for this item',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  trackStock?: boolean;

  @ApiProperty({
    example: false,
    description: 'Allow pre-orders when out of stock',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowPreOrder?: boolean;

  @ApiProperty({ example: '1234567890123', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  barcode?: string;
}
