import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CartItemDto {
  @ApiProperty({
    description: 'Item ID',
    example: 123,
  })
  @IsNumber()
  @Min(1)
  itemId!: number;

  @ApiProperty({
    description: 'Quantity',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity!: number;
}
