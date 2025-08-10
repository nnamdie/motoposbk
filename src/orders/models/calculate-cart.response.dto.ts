import { ApiProperty } from '@nestjs/swagger';

import { CartItemResponseDto } from './cart-item.response.dto';

export class CalculateCartResponseDto {
  @ApiProperty({
    description: 'Cart items with current pricing',
    type: [CartItemResponseDto],
  })
  items!: CartItemResponseDto[];

  @ApiProperty({ description: 'Subtotal in kobo', example: 240000000 })
  subtotal!: number;

  @ApiProperty({ description: 'Tax amount in kobo', example: 7500000 })
  taxAmount!: number;

  @ApiProperty({ description: 'Discount amount in kobo', example: 10000000 })
  discountAmount!: number;

  @ApiProperty({ description: 'Shipping amount in kobo', example: 5000000 })
  shippingAmount!: number;

  @ApiProperty({ description: 'Total amount in kobo', example: 242500000 })
  total!: number;

  @ApiProperty({ description: 'Currency', example: 'NGN' })
  currency!: string;

  @ApiProperty({ description: 'Has any pre-order items', example: false })
  hasPreOrderItems!: boolean;

  @ApiProperty({ description: 'Number of unavailable items', example: 0 })
  unavailableItemsCount!: number;
}
