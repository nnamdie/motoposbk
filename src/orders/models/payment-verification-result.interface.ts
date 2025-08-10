import { PaymentMetadata } from './payment-metadata.interface';

export interface PaymentVerificationResult {
  isSuccessful: boolean;
  transactionId?: string;
  reference: string;
  amount: number;
  currency: string;
  paidAt?: Date;
  failureReason?: string;
  providerResponse?: any;
  // Metadata from provider for payment context
  metadata?: PaymentMetadata;
}
