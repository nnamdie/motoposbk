import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({ description: 'Order item ID', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Item ID', example: 123 })
  itemId!: number;

  @ApiProperty({ description: 'Item SKU', example: 'SAM256BL240001' })
  itemSku!: string;

  @ApiProperty({ description: 'Item name', example: 'Samsung Galaxy S24' })
  itemName!: string;

  @ApiProperty({ description: 'Quantity ordered', example: 2 })
  quantity!: number;

  @ApiProperty({ description: 'Unit price in kobo', example: 120000000 })
  unitPrice!: number;

  @ApiProperty({ description: 'Discount amount in kobo', example: 10000000 })
  discountAmount!: number;

  @ApiProperty({ description: 'Line total in kobo', example: 230000000 })
  lineTotal!: number;

  @ApiProperty({ description: 'Currency', example: 'NGN' })
  currency!: string;

  @ApiProperty({ description: 'Is pre-order item', example: false })
  isPreOrder!: boolean;

  @ApiProperty({ description: 'Reserved quantity', example: 2 })
  reservedQuantity!: number;

  @ApiProperty({ description: 'Fulfilled quantity', example: 0 })
  fulfilledQuantity!: number;

  @ApiProperty({ description: 'Remaining quantity to fulfill', example: 2 })
  remainingQuantity!: number;

  @ApiProperty({ description: 'Is fully fulfilled', example: false })
  isFullyFulfilled!: boolean;

  @ApiPropertyOptional({
    description: 'Line item notes',
    example: 'Black color preferred',
  })
  notes?: string;
}
