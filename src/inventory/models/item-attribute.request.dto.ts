import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ItemAttributeRequestDto {
  @ApiProperty({
    description: 'Attribute name',
    example: 'Color',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Attribute value',
    example: 'Red',
  })
  @IsString()
  value!: string;

  @ApiPropertyOptional({
    description: 'Data type for validation',
    enum: ['string', 'number', 'boolean', 'date'],
    example: 'string',
  })
  @IsOptional()
  @IsIn(['string', 'number', 'boolean', 'date'])
  dataType?: 'string' | 'number' | 'boolean' | 'date';

  @ApiPropertyOptional({
    description: 'Display order for UI',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Whether the attribute is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
