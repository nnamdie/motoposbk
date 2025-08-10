import { ApiProperty } from '@nestjs/swagger';

export class BusinessProfileResponseDto {
  @ApiProperty({ example: 123 })
  id!: number;

  @ApiProperty({ example: 'ABC123' })
  ggId!: string;

  @ApiProperty({ example: 'Tech Solutions Ltd' })
  name!: string;

  @ApiProperty({ example: '+2348012345678' })
  phone!: string;

  @ApiProperty({ example: '123 Business Street, Lagos, Nigeria' })
  address?: string;

  @ApiProperty({ example: 'Technology' })
  industry?: string;

  @ApiProperty({ example: 'Active' })
  status!: string;

  @ApiProperty({ example: 'https://example.com/logo.jpg' })
  logo?: string;

  @ApiProperty({ example: 'Innovative tech solutions for modern businesses' })
  description?: string;

  @ApiProperty({ example: { theme: 'dark', notifications: true } })
  settings?: Record<string, any>;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  approvedAt?: string;
}
