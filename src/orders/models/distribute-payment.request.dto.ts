import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class DistributePaymentRequestDto {
  @ApiProperty({
    description: 'Payment amount to distribute across installments (in kobo)',
    example: 75000000,
  })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({
    description:
      'Target installment number to start distribution from (optional)',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  targetInstallmentNumber?: number;
}
