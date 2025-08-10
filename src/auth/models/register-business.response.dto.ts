import { ApiProperty } from '@nestjs/swagger';

export class BusinessInfoDto {
  @ApiProperty({ example: 'ABC123' })
  ggId!: string;

  @ApiProperty({ example: 'Tech Solutions Ltd' })
  name!: string;

  @ApiProperty({ example: '+2348012345678' })
  phone!: string;

  @ApiProperty({ example: 'Pending' })
  status!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;
}

export class OwnerInfoDto {
  @ApiProperty({ example: 123 })
  id!: number;

  @ApiProperty({ example: 'John Doe' })
  fullName!: string;

  @ApiProperty({ example: '+2348012345678' })
  phone!: string;
}

export class RegisterBusinessResponseDto {
  @ApiProperty({ type: BusinessInfoDto })
  business!: BusinessInfoDto;

  @ApiProperty({ type: OwnerInfoDto })
  owner!: OwnerInfoDto;

  @ApiProperty({
    example: 'Business registration successful. Awaiting approval.',
  })
  message!: string;

  @ApiProperty({ example: 'pending_approval' })
  nextStep!: string;
}
