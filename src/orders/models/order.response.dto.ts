import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CustomerResponseDto } from './customer.response.dto';
import { OrderItemResponseDto } from './order-item.response.dto';
import { PaymentScheduleResponseDto } from './payment-schedule.response.dto';

export class OrderResponseDto {
  @ApiProperty({ description: 'Order ID', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Order number', example: 'ORD-2024-0001' })
  orderNumber!: string;

  @ApiProperty({
    description: 'Customer information',
    type: CustomerResponseDto,
  })
  customer!: CustomerResponseDto;

  @ApiProperty({ description: 'Order type', example: 'Regular' })
  type!: string;

  @ApiProperty({ description: 'Order status', example: 'Pending' })
  status!: string;

  @ApiProperty({ description: 'Order items', type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

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

  @ApiProperty({ description: 'Currency', example: 'NGN' })
  currency!: string;

  @ApiProperty({ description: 'Is pre-order', example: false })
  isPreOrder!: boolean;

  @ApiPropertyOptional({
    description: 'Order notes',
    example: 'Handle with care',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Delivery address',
    example: '456 Delivery Street',
  })
  deliveryAddress?: string;

  @ApiPropertyOptional({
    description: 'Expected delivery date',
    example: '2024-02-01T00:00:00Z',
  })
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({
    description: 'Delivered date',
    example: '2024-02-01T10:30:00Z',
  })
  deliveredAt?: string;

  @ApiProperty({ description: 'Can be cancelled', example: true })
  canBeCancelled!: boolean;

  @ApiProperty({ description: 'Is completed', example: false })
  isCompleted!: boolean;

  @ApiProperty({ description: 'Is cancelled', example: false })
  isCancelled!: boolean;

  @ApiPropertyOptional({
    description:
      'Payments made for this order (supports multiple payments for installments)',
  })
  payments?: {
    id: number;
    paymentNumber: string;
    method: string;
    type: string;
    status: string;
    amount: number;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    bankDetailsExpiryDate?: string;
    paidAt?: string;
  }[];

  @ApiPropertyOptional({
    description: 'Payment schedule for installment orders',
    type: [PaymentScheduleResponseDto],
  })
  paymentSchedule?: PaymentScheduleResponseDto[];

  @ApiProperty({ description: 'Created date', example: '2024-01-15T10:30:00Z' })
  createdAt!: string;

  @ApiProperty({ description: 'Updated date', example: '2024-01-15T10:30:00Z' })
  updatedAt!: string;
}
