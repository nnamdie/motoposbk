import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PAYMENT_PROVIDER_TOKEN } from '../factories/payment-provider.factory';
import { BankDetails } from '../models/bank-details.interface';
import { CreateBankTransferRequest } from '../models/create-bank-transfer-request.interface';
import { PaymentVerificationResult } from '../models/payment-verification-result.interface';
import { AbstractPaymentProvider } from '../providers/abstract-payment-provider';

@Injectable()
export class PaymentProviderService {
  constructor(
    @Inject(PAYMENT_PROVIDER_TOKEN)
    private readonly paymentProvider: AbstractPaymentProvider,
  ) {}

  /**
   * Get the configured payment provider
   */
  getProvider(): AbstractPaymentProvider {
    if (!this.paymentProvider.isAvailable()) {
      throw new BadRequestException(
        `Payment provider '${this.paymentProvider.providerName}' is not available`,
      );
    }
    return this.paymentProvider;
  }

  /**
   * Generate bank details using configured provider
   */
  async generateBankDetails(
    request: CreateBankTransferRequest,
  ): Promise<{ provider: string; bankDetails: BankDetails }> {
    const provider = this.getProvider();
    const bankDetails = await provider.generateBankDetails(request);

    return {
      provider: provider.providerName,
      bankDetails,
    };
  }

  /**
   * Verify payment using configured provider
   */
  async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    const provider = this.getProvider();

    return provider.verifyPayment(reference);
  }

  /**
   * Get supported currencies for the configured provider
   */
  getSupportedCurrencies(): string[] {
    const provider = this.getProvider();

    return provider.getSupportedCurrencies();
  }

  /**
   * Check if a currency is supported by the configured provider
   */
  isCurrencySupported(currency: string): boolean {
    return this.getSupportedCurrencies().includes(currency);
  }
}
