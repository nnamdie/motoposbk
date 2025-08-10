import { PaymentMetadata } from './payment-metadata.interface';

export interface CreateBankTransferRequest {
  amount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  reference: string;
  description?: string;
  expiryMinutes?: number; // How long the bank details should be valid
  // Metadata for payment context
  metadata: PaymentMetadata;
}
