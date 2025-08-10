import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class OrderItemRequestDto {
  @ApiProperty({
    description: 'Item ID',
    example: 123,
  })
  @IsNumber()
  @Min(1)
  itemId!: number;

  @ApiProperty({
    description: 'Quantity to order',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Notes for this line item',
    example: 'Customer prefers black color',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
