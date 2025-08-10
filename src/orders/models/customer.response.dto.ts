import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ description: 'Customer ID', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Customer first name', example: 'John' })
  firstName!: string;

  @ApiPropertyOptional({ description: 'Customer last name', example: 'Doe' })
  lastName?: string;

  @ApiProperty({ description: 'Customer phone', example: '+2348012345678' })
  phone!: string;

  @ApiProperty({ description: 'Customer full name', example: 'John Doe' })
  fullName!: string;
}
