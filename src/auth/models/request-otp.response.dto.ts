import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpResponseDto {
  @ApiProperty({ example: 'pending_verification' })
  nextStep!: string;
}
