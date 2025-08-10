import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { ReservationType } from '../enums/reservation-type.enum';

export class CreateReservationRequestDto {
  @ApiProperty({ example: 123 })
  @IsNumber()
  @Min(1)
  itemId!: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 'PreOrder', enum: ReservationType })
  @IsEnum(ReservationType)
  type!: ReservationType;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerName?: string;

  @ApiProperty({ example: '+2348012345678', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  customerPhone?: string;

  @ApiProperty({ example: 'ORDER-2024-001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @ApiProperty({
    example: 'Customer wants black color variant',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({
    example: '2024-02-01T00:00:00.000Z',
    description: 'When stock is expected',
    required: false,
  })
  @IsOptional()
  @IsString()
  expectedDate?: string;

  @ApiProperty({
    example: '2024-03-01T00:00:00.000Z',
    description: 'When reservation expires',
    required: false,
  })
  @IsOptional()
  @IsString()
  expiryDate?: string;
}
