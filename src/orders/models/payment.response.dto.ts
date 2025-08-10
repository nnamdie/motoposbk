import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaymentDistributionResponseDto } from './payment-distribution.response.dto';

export class PaymentResponseDto {
  @ApiProperty({ description: 'Payment ID', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Payment number', example: 'PAY-2024-0001' })
  paymentNumber!: string;

  @ApiProperty({ description: 'Invoice ID', example: 1 })
  invoiceId!: number;

  @ApiProperty({ description: 'Invoice number', example: 'INV-2024-0001' })
  invoiceNumber!: string;

  @ApiProperty({ description: 'Customer ID', example: 1 })
  customerId!: number;

  @ApiProperty({ description: 'Customer name', example: 'John Doe' })
  customerName!: string;

  @ApiProperty({ description: 'Payment amount in kobo', example: 242500000 })
  amount!: number;

  @ApiProperty({ description: 'Currency', example: 'NGN' })
  currency!: string;

  @ApiProperty({ description: 'Payment method', example: 'Cash' })
  method!: string;

  @ApiProperty({ description: 'Payment type', example: 'OneTime' })
  type!: string;

  @ApiProperty({ description: 'Payment status', example: 'Completed' })
  status!: string;

  @ApiPropertyOptional({
    description: 'External reference',
    example: 'paystack_ref_123456',
  })
  externalReference?: string;

  @ApiPropertyOptional({
    description: 'Provider transaction ID',
    example: 'txn_123456789',
  })
  providerTransactionId?: string;

  @ApiPropertyOptional({ description: 'Payment provider', example: 'paystack' })
  provider?: string;

  @ApiPropertyOptional({
    description: 'Bank name (for bank transfers)',
    example: 'Providus Bank',
  })
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Account number (for bank transfers)',
    example: '9876543210',
  })
  accountNumber?: string;

  @ApiPropertyOptional({
    description: 'Account name (for bank transfers)',
    example: 'PAYSTACK-BUSINESS_NAME',
  })
  accountName?: string;

  @ApiPropertyOptional({
    description: 'Bank details expiry date',
    example: '2024-01-16T10:30:00Z',
  })
  bankDetailsExpiryDate?: string;

  @ApiPropertyOptional({
    description: 'Customer reference',
    example: 'CUST_REF_001',
  })
  reference?: string;

  @ApiPropertyOptional({
    description: 'Payment notes',
    example: 'Cash payment received',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Date payment completed',
    example: '2024-01-15T10:30:00Z',
  })
  paidAt?: string;

  @ApiPropertyOptional({
    description: 'Date payment failed',
    example: '2024-01-15T10:30:00Z',
  })
  failedAt?: string;

  @ApiPropertyOptional({
    description: 'Failure reason',
    example: 'Insufficient funds',
  })
  failureReason?: string;

  @ApiProperty({ description: 'Refunded amount in kobo', example: 0 })
  refundedAmount!: number;

  @ApiPropertyOptional({
    description: 'Date refunded',
    example: '2024-01-20T14:15:00Z',
  })
  refundedAt?: string;

  @ApiProperty({ description: 'Is successful', example: true })
  isSuccessful!: boolean;

  @ApiProperty({ description: 'Is failed', example: false })
  isFailed!: boolean;

  @ApiProperty({ description: 'Is refunded', example: false })
  isRefunded!: boolean;

  @ApiProperty({ description: 'Refundable amount in kobo', example: 242500000 })
  refundableAmount!: number;

  @ApiProperty({ description: 'Created date', example: '2024-01-15T10:30:00Z' })
  createdAt!: string;

  @ApiProperty({ description: 'Updated date', example: '2024-01-15T10:30:00Z' })
  updatedAt!: string;

  @ApiPropertyOptional({
    description: 'Payment distribution details (for installment payments)',
    type: PaymentDistributionResponseDto,
  })
  distribution?: PaymentDistributionResponseDto;
}
