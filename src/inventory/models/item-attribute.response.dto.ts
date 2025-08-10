import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ItemAttributeResponseDto {
  @ApiProperty({
    description: 'Attribute ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Attribute name',
    example: 'Color',
  })
  name!: string;

  @ApiProperty({
    description: 'Attribute value',
    example: 'Red',
  })
  value!: string;

  @ApiPropertyOptional({
    description: 'Data type',
    example: 'string',
  })
  dataType?: string;

  @ApiPropertyOptional({
    description: 'Display order',
    example: 1,
  })
  displayOrder?: number;

  @ApiProperty({
    description: 'Whether the attribute is active',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt!: Date;
}
