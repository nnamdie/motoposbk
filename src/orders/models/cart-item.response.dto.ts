import { ApiProperty } from '@nestjs/swagger';

export class CartItemResponseDto {
  @ApiProperty({ description: 'Item ID', example: 123 })
  itemId!: number;

  @ApiProperty({ description: 'Item SKU', example: 'SAM256BL240001' })
  itemSku!: string;

  @ApiProperty({ description: 'Item name', example: 'Samsung Galaxy S24' })
  itemName!: string;

  @ApiProperty({
    description: 'Current unit price in kobo',
    example: 120000000,
  })
  unitPrice!: number;

  @ApiProperty({ description: 'Requested quantity', example: 2 })
  quantity!: number;

  @ApiProperty({ description: 'Available stock', example: 5 })
  availableStock!: number;

  @ApiProperty({ description: 'Line total in kobo', example: 240000000 })
  lineTotal!: number;

  @ApiProperty({ description: 'Is available in stock', example: true })
  inStock!: boolean;

  @ApiProperty({ description: 'Will be pre-order', example: false })
  isPreOrder!: boolean;
}
