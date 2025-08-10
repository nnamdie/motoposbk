import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentScheduleResponseDto {
  @ApiProperty({ description: 'Schedule ID', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Invoice ID', example: 1 })
  invoiceId!: number;

  @ApiProperty({ description: 'Installment number', example: 1 })
  installmentNumber!: number;

  @ApiProperty({ description: 'Due date', example: '2024-02-15' })
  dueDate!: string;

  @ApiProperty({ description: 'Amount due in kobo', example: 25000000 })
  amountDue!: number;

  @ApiProperty({ description: 'Amount paid in kobo', example: 25000000 })
  amountPaid!: number;

  @ApiProperty({ description: 'Remaining balance in kobo', example: 0 })
  remainingBalance!: number;

  @ApiProperty({ description: 'Currency', example: 'NGN' })
  currency!: string;

  @ApiProperty({ description: 'Schedule status', example: 'Paid' })
  status!: string;

  @ApiPropertyOptional({
    description: 'Schedule notes',
    example: 'Payment received on time',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Date when fully paid',
    example: '2024-02-15T10:30:00Z',
  })
  paidAt?: string;

  @ApiPropertyOptional({
    description: 'Last payment date',
    example: '2024-02-15T10:30:00Z',
  })
  lastPaymentAt?: string;

  @ApiProperty({ description: 'Is fully paid', example: true })
  isFullyPaid!: boolean;

  @ApiProperty({ description: 'Is partially paid', example: false })
  isPartiallyPaid!: boolean;

  @ApiProperty({ description: 'Is overdue', example: false })
  isOverdue!: boolean;

  @ApiProperty({ description: 'Created date', example: '2024-01-15T10:30:00Z' })
  createdAt!: string;

  @ApiProperty({ description: 'Updated date', example: '2024-01-15T10:30:00Z' })
  updatedAt!: string;
}
