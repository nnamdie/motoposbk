import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceResponseDto {
  @ApiProperty({ description: 'Invoice ID', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Invoice number', example: 'INV-2024-0001' })
  invoiceNumber!: string;

  @ApiProperty({ description: 'Order ID', example: 1 })
  orderId!: number;

  @ApiProperty({ description: 'Order number', example: 'ORD-2024-0001' })
  orderNumber!: string;

  @ApiProperty({ description: 'Customer ID', example: 1 })
  customerId!: number;

  @ApiProperty({ description: 'Customer name', example: 'John Doe' })
  customerName!: string;

  @ApiProperty({ description: 'Customer phone', example: '+2348012345678' })
  customerPhone!: string;

  @ApiProperty({ description: 'Invoice type', example: 'Standard' })
  type!: string;

  @ApiProperty({ description: 'Invoice status', example: 'Draft' })
  status!: string;

  @ApiProperty({ description: 'Issue date', example: '2024-01-15' })
  issueDate!: string;

  @ApiProperty({ description: 'Due date', example: '2024-02-15' })
  dueDate!: string;

  @ApiProperty({ description: 'Subtotal in kobo', example: 240000000 })
  subtotal!: number;

  @ApiProperty({ description: 'Tax amount in kobo', example: 7500000 })
  taxAmount!: number;

  @ApiProperty({ description: 'Discount amount in kobo', example: 10000000 })
  discountAmount!: number;

  @ApiProperty({ description: 'Shipping amount in kobo', example: 5000000 })
  shippingAmount!: number;

  @ApiProperty({ description: 'Total amount in kobo', example: 242500000 })
  total!: number;

  @ApiProperty({ description: 'Paid amount in kobo', example: 0 })
  paidAmount!: number;

  @ApiProperty({ description: 'Balance amount in kobo', example: 242500000 })
  balanceAmount!: number;

  @ApiProperty({ description: 'Currency', example: 'NGN' })
  currency!: string;

  @ApiPropertyOptional({
    description: 'Invoice notes',
    example: 'Payment due within 30 days',
  })
  notes?: string;

  @ApiPropertyOptional({ description: 'Payment terms', example: 'Net 30 days' })
  terms?: string;

  @ApiPropertyOptional({
    description: 'Date sent to customer',
    example: '2024-01-15T10:30:00Z',
  })
  sentAt?: string;

  @ApiPropertyOptional({
    description: 'Date fully paid',
    example: '2024-01-20T14:15:00Z',
  })
  paidAt?: string;

  @ApiProperty({ description: 'Is fully paid', example: false })
  isFullyPaid!: boolean;

  @ApiProperty({ description: 'Is overdue', example: false })
  isOverdue!: boolean;

  @ApiProperty({ description: 'Can be voided', example: true })
  canBeVoided!: boolean;

  @ApiProperty({ description: 'Created date', example: '2024-01-15T10:30:00Z' })
  createdAt!: string;

  @ApiProperty({ description: 'Updated date', example: '2024-01-15T10:30:00Z' })
  updatedAt!: string;
}
