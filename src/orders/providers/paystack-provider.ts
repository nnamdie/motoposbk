import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BankDetails } from '../models/bank-details.interface';
import { CreateBankTransferRequest } from '../models/create-bank-transfer-request.interface';
import { PaymentVerificationResult } from '../models/payment-verification-result.interface';
import { AbstractPaymentProvider } from './abstract-payment-provider';

@Injectable()
export class PaystackProvider extends AbstractPaymentProvider {
  private readonly logger = new Logger(PaystackProvider.name);
  readonly providerName = 'paystack';

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async generateBankDetails(
    request: CreateBankTransferRequest,
  ): Promise<BankDetails> {
    // TODO: Implement actual Paystack API call
    // For now, return mock data
    this.logger.log(
      `Generating bank details for ${request.reference} via Paystack`,
    );

    // Mock implementation - replace with actual Paystack API call
    // In real implementation, Paystack would receive metadata like:
    // {
    //   invoice_id: request.metadata.invoiceId.toString(),
    //   order_id: request.metadata.orderId.toString(),
    //   payment_type: request.metadata.paymentType,
    //   expected_amount: request.metadata.expectedAmount.toString(),
    //   business_id: request.metadata.businessId,
    // }

    return {
      bankName: 'Providus Bank',
      accountNumber: '9876543210',
      accountName: 'PAYSTACK-BUSINESS_NAME',
      reference: request.reference,
      amount: request.amount,
      currency: request.currency,
      expiryDate: request.expiryMinutes
        ? new Date(Date.now() + request.expiryMinutes * 60 * 1000)
        : undefined,
      instructions:
        'Transfer the exact amount to the account above. Payment will be confirmed automatically.',
    };
  }

  async verifyPayment(reference: string): Promise<PaymentVerificationResult> {
    // TODO: Implement actual Paystack verification API call
    this.logger.log(`Verifying payment for reference: ${reference}`);

    // Mock implementation - replace with actual Paystack API call
    // In real implementation, Paystack would return metadata from the webhook/verification
    return {
      isSuccessful: false, // Will be determined by actual API response
      reference,
      amount: 0, // Will be from API response
      currency: 'NGN',
      failureReason: 'Payment not yet received', // Or success data
      // Mock metadata - in real implementation this comes from Paystack
      metadata: {
        invoiceId: 0,
        orderId: 0,
        paymentType: 'OneTime',
        expectedAmount: 0,
        businessId: '',
      },
    };
  }

  getSupportedCurrencies(): string[] {
    return ['NGN'];
  }

  isAvailable(): boolean {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    const publicKey = this.configService.get<string>('PAYSTACK_PUBLIC_KEY');

    return !!(secretKey && publicKey);
  }

  getConfigRequirements(): string[] {
    return ['PAYSTACK_SECRET_KEY', 'PAYSTACK_PUBLIC_KEY'];
  }

  private getSecretKey(): string {
    const key = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!key) {
      throw new Error('Paystack secret key not configured');
    }
    return key;
  }

  private getPublicKey(): string {
    const key = this.configService.get<string>('PAYSTACK_PUBLIC_KEY');

    if (!key) {
      throw new Error('Paystack public key not configured');
    }
    return key;
  }
}
