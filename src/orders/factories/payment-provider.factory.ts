import { ConfigService } from '@nestjs/config';

import { PaymentProvider } from '../enums/payment-provider.enum';
import { AbstractPaymentProvider } from '../providers/abstract-payment-provider';
import { FlutterwaveProvider } from '../providers/flutterwave-provider';
import { PaystackProvider } from '../providers/paystack-provider';

export const PAYMENT_PROVIDER_TOKEN = 'PAYMENT_PROVIDER';

export const paymentProviderFactory = {
  provide: PAYMENT_PROVIDER_TOKEN,
  useFactory: (configService: ConfigService): AbstractPaymentProvider => {
    const provider =
      configService.get<PaymentProvider>('DEFAULT_PAYMENT_PROVIDER') ||
      PaymentProvider.PAYSTACK;

    switch (provider) {
      case PaymentProvider.PAYSTACK:
        return new PaystackProvider(configService);
      case PaymentProvider.FLUTTERWAVE:
        return new FlutterwaveProvider(configService);
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  },
  inject: [ConfigService],
};
