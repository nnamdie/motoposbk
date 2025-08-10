import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterBusinessRequestDto {
  // Business Information
  @ApiProperty({ example: 'Tech Solutions Ltd' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  businessName!: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsPhoneNumber('NG')
  businessPhone!: string;

  @ApiProperty({
    example: '123 Business Street, Lagos, Nigeria',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  businessAddress?: string;

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
  businessDescription?: string;

  // Owner Information
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  ownerFirstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  ownerLastName!: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsPhoneNumber('NG')
  ownerPhone!: string;

  @ApiProperty({ example: 'SecurePassword123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password!: string;
}
