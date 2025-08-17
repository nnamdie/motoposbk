import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class RequestOtpRequestDto {
  @ApiProperty({ example: '+2348012345678' })
  @IsPhoneNumber('NG')
  phone!: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(1)
  password!: string;
}
