import { BankDetails } from '../models/bank-details.interface';
import { CreateBankTransferRequest } from '../models/create-bank-transfer-request.interface';
import { PaymentVerificationResult } from '../models/payment-verification-result.interface';

export abstract class AbstractPaymentProvider {
  abstract readonly providerName: string;

  /**
   * Generate bank details for receiving payment
   */
  abstract generateBankDetails(
    request: CreateBankTransferRequest,
  ): Promise<BankDetails>;

  /**
   * Verify payment status using reference
   */
  abstract verifyPayment(reference: string): Promise<PaymentVerificationResult>;

  /**
   * Get supported currencies
   */
  abstract getSupportedCurrencies(): string[];

  /**
   * Check if provider is available/configured
   */
  abstract isAvailable(): boolean;

  /**
   * Get provider-specific configuration requirements
   */
  abstract getConfigRequirements(): string[];
}
