import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { InstallmentFrequency } from '../enums/installment-frequency.enum';
import { OrderType } from '../enums/order-type.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentType } from '../enums/payment-type.enum';
import { CustomerInfoDto } from './customer-info.request.dto';
import { OrderItemRequestDto } from './order-item.request.dto';

export class CreateOrderRequestDto {
  @ApiProperty({
    description: 'Customer information',
    type: CustomerInfoDto,
  })
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customer!: CustomerInfoDto;

  @ApiProperty({
    description: 'Order items',
    type: [OrderItemRequestDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemRequestDto)
  items!: OrderItemRequestDto[];

  @ApiPropertyOptional({
    description: 'Order type',
    enum: OrderType,
    example: OrderType.REGULAR,
  })
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  // Payment Information (Required)
  @ApiProperty({
    description: 'Payment method (required)',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({
    description: 'Payment type (required)',
    enum: PaymentType,
    example: PaymentType.ONE_TIME,
  })
  @IsEnum(PaymentType)
  paymentType!: PaymentType;

  @ApiPropertyOptional({
    description: 'Down payment amount for installments (in kobo)',
    example: 50000000,
  })
  @ValidateIf((o) => o.paymentType === PaymentType.INSTALLMENT)
  @IsNumber()
  @Min(1)
  downPaymentAmount?: number;

  @ApiProperty({
    description: 'Installment frequency (required for installment payments)',
    enum: InstallmentFrequency,
    example: InstallmentFrequency.MONTHLY,
  })
  @ValidateIf((o) => o.paymentType === PaymentType.INSTALLMENT)
  @IsEnum(InstallmentFrequency)
  installmentFrequency?: InstallmentFrequency;

  @ApiProperty({
    description: 'Number of installments (required for installment payments)',
    example: 6,
    minimum: 2,
    maximum: 24,
  })
  @ValidateIf((o) => o.paymentType === PaymentType.INSTALLMENT)
  @IsNumber()
  @Min(2, { message: 'Number of installments must be at least 2' })
  @Max(24, { message: 'Number of installments cannot exceed 24' })
  numberOfInstallments?: number;

  @ApiPropertyOptional({
    description: 'Tax amount override',
    example: 7500000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({
    description: 'Discount amount override',
    example: 10000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Shipping amount override',
    example: 5000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingAmount?: number;

  @ApiPropertyOptional({
    description: 'Order notes',
    example: 'Handle with care',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Delivery address',
    example: '456 Delivery Street, Abuja',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deliveryAddress?: string;

  @ApiPropertyOptional({
    description: 'Expected delivery date',
    example: '2024-02-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;
}
