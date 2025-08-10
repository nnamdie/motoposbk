import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

import { CartItemDto } from './cart-item.request.dto';

export class CalculateCartRequestDto {
  @ApiProperty({
    description: 'Cart items',
    type: [CartItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items!: CartItemDto[];

  @ApiPropertyOptional({
    description: 'Tax amount override (optional)',
    example: 7500000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({
    description: 'Discount amount override (optional)',
    example: 10000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Shipping amount override (optional)',
    example: 5000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingAmount?: number;
}
