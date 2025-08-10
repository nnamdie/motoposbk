import { ApiProperty } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateBusinessProfileRequestDto {
  @ApiProperty({ example: 'Tech Solutions Ltd', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ example: '+2348012345678', required: false })
  @IsOptional()
  @IsPhoneNumber('NG')
  phone?: string;

  @ApiProperty({
    example: '123 Business Street, Lagos, Nigeria',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ example: 'Technology', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiProperty({
    example: 'Innovative tech solutions for modern businesses',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 'https://example.com/logo.jpg', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  logo?: string;

  @ApiProperty({
    example: { theme: 'dark', notifications: true },
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
