import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaymentScheduleResponseDto } from './payment-schedule.response.dto';

export class PaymentDistributionResponseDto {
  @ApiProperty({
    description: 'Amount successfully applied to installments (in kobo)',
    example: 75000000,
  })
  appliedAmount!: number;

  @ApiProperty({
    description:
      'Excess amount that could not be applied (overpayment in kobo)',
    example: 0,
  })
  excessAmount!: number;

  @ApiProperty({
    description: 'Updated payment schedules',
    type: [PaymentScheduleResponseDto],
  })
  updatedSchedules!: PaymentScheduleResponseDto[];

  @ApiProperty({
    description: 'Whether the invoice is now fully paid',
    example: true,
  })
  invoiceFullyPaid!: boolean;

  @ApiPropertyOptional({
    description: 'Distribution summary message',
    example:
      'Payment of ₦750,000 distributed across 3 installments. Overpayment of ₦50,000 recorded.',
  })
  summary?: string;
}
