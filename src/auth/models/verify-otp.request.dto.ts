import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyOtpRequestDto {
  @ApiProperty({ example: '+2348012345678' })
  @IsPhoneNumber('NG')
  phone!: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code' })
  @IsString()
  @Length(6, 6)
  otpCode!: string;
}
