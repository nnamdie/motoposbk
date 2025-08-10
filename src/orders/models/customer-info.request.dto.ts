import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CustomerInfoDto {
  @ApiProperty({
    description: 'Customer first name',
    example: 'John',
  })
  @IsString()
  @MaxLength(255)
  firstName!: string;

  @ApiPropertyOptional({
    description: 'Customer last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lastName?: string;

  @ApiProperty({
    description: 'Customer phone number (primary identifier)',
    example: '+2348012345678',
  })
  @IsString()
  @MaxLength(20)
  phone!: string;

  @ApiPropertyOptional({
    description: 'Customer address',
    example: '123 Main Street, Lagos',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
