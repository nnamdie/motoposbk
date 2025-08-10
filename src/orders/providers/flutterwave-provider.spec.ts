import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateBankTransferRequest } from '../models/create-bank-transfer-request.interface';
import { FlutterwaveProvider } from './flutterwave-provider';

describe('FlutterwaveProvider', () => {
  let provider: FlutterwaveProvider;
  let configService: ConfigService;

  const mockCreateBankTransferRequest: CreateBankTransferRequest = {
    amount: 10000,
    currency: 'NGN',
    customerName: 'John Doe',
    customerPhone: '+2348012345678',
    customerEmail: 'john@example.com',
    reference: 'TEST_REF_123',
    description: 'Payment for Order ORD_123',
    expiryMinutes: 1440,
    metadata: {
      invoiceId: 1,
      orderId: 1,
      paymentType: 'OneTime',
      expectedAmount: 10000,
      businessId: 'business_123',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlutterwaveProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'FLUTTERWAVE_SECRET_KEY':
                  return 'FLWSECK_TEST-mock_secret_key';
                case 'FLUTTERWAVE_PUBLIC_KEY':
                  return 'FLWPUBK_TEST-mock_public_key';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    provider = module.get<FlutterwaveProvider>(FlutterwaveProvider);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should have correct provider name', () => {
    expect(provider.providerName).toBe('flutterwave');
  });

  describe('isAvailable', () => {
    it('should return true when API keys are configured', () => {
      expect(provider.isAvailable()).toBe(true);
      expect(configService.get).toHaveBeenCalledWith('FLUTTERWAVE_SECRET_KEY');
      expect(configService.get).toHaveBeenCalledWith('FLUTTERWAVE_PUBLIC_KEY');
    });

    it('should return false when secret key is missing', () => {
      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'FLUTTERWAVE_SECRET_KEY') return null;
        if (key === 'FLUTTERWAVE_PUBLIC_KEY')
          return 'FLWPUBK_TEST-mock_public_key';
        return null;
      });

      expect(provider.isAvailable()).toBe(false);
    });

    it('should return false when public key is missing', () => {
      (configService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'FLUTTERWAVE_SECRET_KEY')
          return 'FLWSECK_TEST-mock_secret_key';
        if (key === 'FLUTTERWAVE_PUBLIC_KEY') return null;
        return null;
      });

      expect(provider.isAvailable()).toBe(false);
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return supported currencies', () => {
      const currencies = provider.getSupportedCurrencies();

      expect(currencies).toContain('NGN');
    });
  });

  describe('getConfigRequirements', () => {
    it('should return required configuration keys', () => {
      const requirements = provider.getConfigRequirements();

      expect(requirements).toContain('FLUTTERWAVE_SECRET_KEY');
      expect(requirements).toContain('FLUTTERWAVE_PUBLIC_KEY');
    });
  });

  describe('generateBankDetails', () => {
    it('should generate mock bank details', async () => {
      const result = await provider.generateBankDetails(
        mockCreateBankTransferRequest,
      );

      expect(result).toHaveProperty('bankName', 'Wema Bank');
      expect(result).toHaveProperty('accountNumber');
      expect(result).toHaveProperty('accountName', 'FLW-BUSINESS_NAME');
      expect(result).toHaveProperty(
        'reference',
        mockCreateBankTransferRequest.reference,
      );
      expect(result).toHaveProperty(
        'amount',
        mockCreateBankTransferRequest.amount,
      );
      expect(result).toHaveProperty(
        'currency',
        mockCreateBankTransferRequest.currency,
      );
      expect(result).toHaveProperty('expiryDate');
      expect(result).toHaveProperty('instructions');

      // Verify account number format (10 digits)
      expect(result.accountNumber).toMatch(/^\d{10}$/);

      // Verify expiry date is in the future
      expect(result.expiryDate).toBeInstanceOf(Date);
      expect(result.expiryDate!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle different customer names', async () => {
      const requestWithDifferentName = {
        ...mockCreateBankTransferRequest,
        customerName: 'Jane Smith',
      };

      const result = await provider.generateBankDetails(
        requestWithDifferentName,
      );

      expect(result.accountName).toBe('FLW-BUSINESS_NAME');
    });

    it('should handle custom expiry minutes', async () => {
      const requestWithCustomExpiry = {
        ...mockCreateBankTransferRequest,
        expiryMinutes: 180, // 3 hours
      };

      const result = await provider.generateBankDetails(
        requestWithCustomExpiry,
      );

      const expectedExpiryTime = Date.now() + 180 * 60 * 1000;
      const actualExpiryTime = result.expiryDate!.getTime();

      // Allow 1 second tolerance for test execution time
      expect(Math.abs(actualExpiryTime - expectedExpiryTime)).toBeLessThan(
        1000,
      );
    });
  });

  describe('verifyPayment', () => {
    it('should return mock verification result', async () => {
      const result = await provider.verifyPayment('TEST_REF_123');

      expect(result).toHaveProperty('isSuccessful', false);
      expect(result).toHaveProperty('reference', 'TEST_REF_123');
      expect(result).toHaveProperty('amount', 0);
      expect(result).toHaveProperty('currency', 'NGN');
      expect(result).toHaveProperty(
        'failureReason',
        'Payment not yet received',
      );
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('paymentType', 'OneTime');
    });

    it('should handle different references', async () => {
      const testReference = 'DIFFERENT_REF_456';
      const result = await provider.verifyPayment(testReference);

      expect(result.reference).toBe(testReference);
    });
  });
});
