import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { PaymentMethod } from '../enums/payment-method.enum';

export class CreatePaymentRequestDto {
  @ApiProperty({
    description: 'Payment amount in kobo',
    example: 242500000,
  })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({
    description: 'External reference (for online payments)',
    example: 'paystack_ref_123456',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  externalReference?: string;

  @ApiPropertyOptional({
    description: 'Customer reference',
    example: 'CUST_REF_001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;

  @ApiPropertyOptional({
    description: 'Payment notes',
    example: 'Cash payment received',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
