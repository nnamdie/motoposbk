import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: 123 })
  id!: number;

  @ApiProperty({ example: 'John' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ example: '+2348012345678' })
  phone!: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  avatar?: string;
}

export class BusinessContextDto {
  @ApiProperty({ example: 'ABC123' })
  ggId!: string;

  @ApiProperty({ example: 'Tech Solutions Ltd' })
  name!: string;

  @ApiProperty({ example: 'Active' })
  status!: string;

  @ApiProperty({ example: 'CEO' })
  position?: string;

  @ApiProperty({ example: true })
  isOwner!: boolean;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({ example: 3600 })
  expiresIn!: number;

  @ApiProperty({ type: UserProfileDto })
  user!: UserProfileDto;

  @ApiProperty({ type: BusinessContextDto })
  business!: BusinessContextDto;

  @ApiProperty({ example: ['items.create', 'orders.manage'] })
  permissions!: string[];

  @ApiProperty({ example: ['Manager', 'Sales'] })
  roles!: string[];
}
