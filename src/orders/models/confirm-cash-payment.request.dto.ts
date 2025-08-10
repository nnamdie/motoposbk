import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ConfirmCashPaymentRequestDto {
  @ApiPropertyOptional({
    description: 'Payment confirmation notes',
    example: 'Cash payment received from customer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Customer reference or receipt number',
    example: 'RECEIPT_001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;
}
