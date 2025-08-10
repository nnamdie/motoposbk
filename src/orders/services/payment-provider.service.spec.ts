import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PAYMENT_PROVIDER_TOKEN } from '../factories/payment-provider.factory';
import { BankDetails } from '../models/bank-details.interface';
import { CreateBankTransferRequest } from '../models/create-bank-transfer-request.interface';
import { PaymentVerificationResult } from '../models/payment-verification-result.interface';
import { AbstractPaymentProvider } from '../providers/abstract-payment-provider';
import { PaymentProviderService } from './payment-provider.service';

describe('PaymentProviderService', () => {
  let service: PaymentProviderService;
  let mockPaymentProvider: jest.Mocked<AbstractPaymentProvider>;

  const mockBankDetails: BankDetails = {
    bankName: 'Test Bank',
    accountNumber: '1234567890',
    accountName: 'Test Account',
    reference: 'TEST_REF_123',
    amount: 10000,
    currency: 'NGN',
    expiryDate: new Date('2024-12-31'),
    instructions: 'Transfer to this account',
  };

  const mockPaymentVerification: PaymentVerificationResult = {
    isSuccessful: true,
    transactionId: 'TXN_123',
    reference: 'TEST_REF_123',
    amount: 10000,
    currency: 'NGN',
    paidAt: new Date(),
    metadata: {
      invoiceId: 1,
      orderId: 1,
      paymentType: 'OneTime',
      expectedAmount: 10000,
      businessId: 'business_123',
    },
  };

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
    mockPaymentProvider = {
      providerName: 'TestProvider',
      generateBankDetails: jest.fn(),
      verifyPayment: jest.fn(),
      getSupportedCurrencies: jest.fn(),
      isAvailable: jest.fn(),
      getConfigRequirements: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentProviderService,
        {
          provide: PAYMENT_PROVIDER_TOKEN,
          useValue: mockPaymentProvider,
        },
      ],
    }).compile();

    service = module.get<PaymentProviderService>(PaymentProviderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProvider', () => {
    it('should return the payment provider when available', () => {
      mockPaymentProvider.isAvailable.mockReturnValue(true);

      const result = service.getProvider();

      expect(result).toBe(mockPaymentProvider);
      expect(mockPaymentProvider.isAvailable).toHaveBeenCalled();
    });

    it('should throw BadRequestException when provider is not available', () => {
      mockPaymentProvider.isAvailable.mockReturnValue(false);

      expect(() => service.getProvider()).toThrow(BadRequestException);
      expect(() => service.getProvider()).toThrow(
        "Payment provider 'TestProvider' is not available",
      );
    });
  });

  describe('generateBankDetails', () => {
    it('should generate bank details successfully', async () => {
      mockPaymentProvider.isAvailable.mockReturnValue(true);
      mockPaymentProvider.generateBankDetails.mockResolvedValue(
        mockBankDetails,
      );

      const result = await service.generateBankDetails(
        mockCreateBankTransferRequest,
      );

      expect(result).toEqual({
        provider: 'TestProvider',
        bankDetails: mockBankDetails,
      });
      expect(mockPaymentProvider.generateBankDetails).toHaveBeenCalledWith(
        mockCreateBankTransferRequest,
      );
    });

    it('should throw BadRequestException when provider is not available', async () => {
      mockPaymentProvider.isAvailable.mockReturnValue(false);

      await expect(
        service.generateBankDetails(mockCreateBankTransferRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      mockPaymentProvider.isAvailable.mockReturnValue(true);
      mockPaymentProvider.verifyPayment.mockResolvedValue(
        mockPaymentVerification,
      );

      const result = await service.verifyPayment('TEST_REF_123');

      expect(result).toEqual(mockPaymentVerification);
      expect(mockPaymentProvider.verifyPayment).toHaveBeenCalledWith(
        'TEST_REF_123',
      );
    });

    it('should throw BadRequestException when provider is not available', async () => {
      mockPaymentProvider.isAvailable.mockReturnValue(false);

      await expect(service.verifyPayment('TEST_REF_123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return supported currencies', () => {
      const mockCurrencies = ['NGN', 'USD', 'GHS'];

      mockPaymentProvider.isAvailable.mockReturnValue(true);
      mockPaymentProvider.getSupportedCurrencies.mockReturnValue(
        mockCurrencies,
      );

      const result = service.getSupportedCurrencies();

      expect(result).toEqual(mockCurrencies);
      expect(mockPaymentProvider.getSupportedCurrencies).toHaveBeenCalled();
    });

    it('should throw BadRequestException when provider is not available', () => {
      mockPaymentProvider.isAvailable.mockReturnValue(false);

      expect(() => service.getSupportedCurrencies()).toThrow(
        BadRequestException,
      );
    });
  });

  describe('isCurrencySupported', () => {
    it('should return true for supported currency', () => {
      const mockCurrencies = ['NGN', 'USD', 'GHS'];

      mockPaymentProvider.isAvailable.mockReturnValue(true);
      mockPaymentProvider.getSupportedCurrencies.mockReturnValue(
        mockCurrencies,
      );

      const result = service.isCurrencySupported('NGN');

      expect(result).toBe(true);
    });

    it('should return false for unsupported currency', () => {
      const mockCurrencies = ['NGN', 'USD', 'GHS'];

      mockPaymentProvider.isAvailable.mockReturnValue(true);
      mockPaymentProvider.getSupportedCurrencies.mockReturnValue(
        mockCurrencies,
      );

      const result = service.isCurrencySupported('EUR');

      expect(result).toBe(false);
    });
  });
});
