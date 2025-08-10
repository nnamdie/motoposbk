import { ApiProperty } from '@nestjs/swagger';

import { ItemAttributeResponseDto } from './item-attribute.response.dto';

export class ItemResponseDto {
  @ApiProperty({ example: 123 })
  id!: number;

  @ApiProperty({ example: 'SAM256PRO240001' })
  sku!: string;

  @ApiProperty({ example: 'Samsung Galaxy S24' })
  name!: string;

  @ApiProperty({ example: 'SM-S921B' })
  modelNo?: string;

  @ApiProperty({ example: 'Latest Samsung flagship smartphone' })
  description?: string;

  @ApiProperty({ example: 'Electronics' })
  category?: string;

  @ApiProperty({ example: 'Samsung' })
  brand?: string;

  @ApiProperty({ example: ['https://s3.example.com/image1.jpg'] })
  images?: string[];

  @ApiProperty({
    type: [ItemAttributeResponseDto],
    description: 'Item attributes',
  })
  attributes!: ItemAttributeResponseDto[];

  @ApiProperty({ example: 80000000, description: 'Cost price in kobo' })
  costPrice!: number;

  @ApiProperty({ example: 120000000, description: 'Selling price in kobo' })
  sellingPrice!: number;

  @ApiProperty({ example: 110000000, description: 'Discount price in kobo' })
  discountPrice?: number;

  @ApiProperty({ example: 'NGN' })
  currency!: string;

  @ApiProperty({ example: 'pcs' })
  unit?: string;

  @ApiProperty({ example: 15 })
  totalStock!: number;

  @ApiProperty({ example: 3 })
  reservedStock!: number;

  @ApiProperty({ example: 12 })
  availableStock!: number;

  @ApiProperty({ example: 5 })
  minimumStock!: number;

  @ApiProperty({ example: 'Active' })
  status!: string;

  @ApiProperty({ example: true })
  trackStock!: boolean;

  @ApiProperty({ example: false })
  allowPreOrder!: boolean;

  @ApiProperty({ example: true })
  inStock!: boolean;

  @ApiProperty({ example: false })
  isLowStock!: boolean;

  @ApiProperty({ example: true })
  canOrder!: boolean;

  @ApiProperty({ example: '1234567890123' })
  barcode?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: string;
}
