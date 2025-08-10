import { InstallmentFrequency } from '../enums/installment-frequency.enum';

export interface InstallmentPlan {
  totalAmount: number;
  downPaymentAmount: number;
  frequency: InstallmentFrequency;
  numberOfInstallments?: number;
  startDate?: Date;
}
