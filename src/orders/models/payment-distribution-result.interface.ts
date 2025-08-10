import { PaymentSchedule } from '../entities/payment-schedule.entity';

export interface PaymentDistributionResult {
  appliedAmount: number;
  excessAmount: number;
  updatedSchedules: PaymentSchedule[];
  invoiceFullyPaid: boolean;
}
