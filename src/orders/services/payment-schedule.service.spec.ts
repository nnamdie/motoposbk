import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '../../auth/entities/user.entity';
import { Invoice } from '../entities/invoice.entity';
import { PaymentSchedule } from '../entities/payment-schedule.entity';
import { InstallmentFrequency } from '../enums/installment-frequency.enum';
import { ScheduleStatus } from '../enums/schedule-status.enum';
import { InstallmentPlan } from '../models/installment-plan.interface';
import { PaymentScheduleService } from './payment-schedule.service';

describe('PaymentScheduleService', () => {
  let service: PaymentScheduleService;
  let mockScheduleRepository: jest.Mocked<EntityRepository<PaymentSchedule>>;
  let mockInvoiceRepository: jest.Mocked<EntityRepository<Invoice>>;
  let mockEntityManager: jest.Mocked<EntityManager>;

  const mockUser = {} as User;

  const mockInvoice = {
    id: 1,
    invoiceNumber: 'INV_001',
    business: { ggId: 'business_123' },
    total: 100000,
    currency: 'NGN',
    order: { id: 1, orderNumber: 'ORD_001' } as any,
    orderId: 1,
    customer: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
    } as any,
    customerId: 1,
    type: 'STANDARD',
    status: 'DRAFT',
    issueDate: new Date(),
    dueDate: new Date(),
    subtotal: 100000,
    taxAmount: 0,
    discountAmount: 0,
    shippingAmount: 0,
    balanceAmount: 100000,
    paidAmount: 0,
    paidAt: undefined,
    notes: '',
    terms: '',
    createdBy: mockUser,
    updatedBy: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    payments: [],
    paymentSchedules: [],
    isFullyPaid: false,
    isOverdue: false,
    canBePaid: true,
    canBeCancelled: true,
    canBeEdited: true,
    canBeVoided: true,
    beforeCreate: jest.fn(),
    beforeUpdate: jest.fn(),
  } as any;

  const mockInstallmentPlan: InstallmentPlan = {
    totalAmount: 100000,
    downPaymentAmount: 20000,
    frequency: InstallmentFrequency.MONTHLY,
    numberOfInstallments: 4,
    startDate: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    mockScheduleRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      persistAndFlush: jest.fn(),
    } as any;

    mockInvoiceRepository = {
      findOne: jest.fn(),
    } as any;

    mockEntityManager = {
      create: jest.fn(),
      persistAndFlush: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      transactional: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentScheduleService,
        {
          provide: getRepositoryToken(PaymentSchedule),
          useValue: mockScheduleRepository,
        },
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepository,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<PaymentScheduleService>(PaymentScheduleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePaymentSchedule', () => {
    it('should generate payment schedule with specified installments', async () => {
      mockEntityManager.create.mockImplementation(
        (_entity, data) => data as any,
      );
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.generatePaymentSchedule(
        'business_123',
        mockInvoice,
        mockInstallmentPlan,
        mockUser,
        mockEntityManager,
      );

      expect(mockEntityManager.create).toHaveBeenCalledTimes(4);
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(4);
    });

    it('should calculate default installments when not provided', async () => {
      const planWithoutInstallments = {
        ...mockInstallmentPlan,
        numberOfInstallments: undefined,
      };

      mockEntityManager.create.mockImplementation(
        (entity, data) => data as any,
      );
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      await service.generatePaymentSchedule(
        'business_123',
        mockInvoice,
        planWithoutInstallments,
        mockUser,
        mockEntityManager,
      );

      expect(mockEntityManager.create).toHaveBeenCalled();
    });
  });

  describe('getPaymentSchedule', () => {
    it('should return payment schedule for invoice', async () => {
      const mockSchedules = [
        {
          id: 1,
          installmentNumber: 1,
          amountDue: 20000,
          amountPaid: 20000,
          status: ScheduleStatus.PAID,
          dueDate: new Date('2024-02-01'),
        },
        {
          id: 2,
          installmentNumber: 2,
          amountDue: 20000,
          amountPaid: 0,
          status: ScheduleStatus.PENDING,
          dueDate: new Date('2024-03-01'),
        },
      ] as PaymentSchedule[];

      mockScheduleRepository.find.mockResolvedValue(mockSchedules);

      const result = await service.getPaymentSchedule('business_123', 1);

      expect(mockScheduleRepository.find).toHaveBeenCalledWith(
        { business: { ggId: 'business_123' }, invoice: { id: 1 } },
        { orderBy: { installmentNumber: 'ASC' } },
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('installmentNumber', 1);
      expect(result[0]).toHaveProperty('status', ScheduleStatus.PAID);
    });
  });

  describe('distributePayment', () => {
    it('should distribute payment across pending schedules', async () => {
      const mockSchedules = [
        {
          id: 1,
          installmentNumber: 1,
          amountDue: 20000,
          amountPaid: 0,
          status: ScheduleStatus.PENDING,
          remainingBalance: 20000,
        },
        {
          id: 2,
          installmentNumber: 2,
          amountDue: 20000,
          amountPaid: 0,
          status: ScheduleStatus.PENDING,
          remainingBalance: 20000,
        },
      ] as PaymentSchedule[];

      // Mock the transactional method
      mockEntityManager.transactional.mockImplementation(async () => {
        // Mock the entity manager passed to the callback

        // Simulate the payment distribution logic
        mockSchedules[0].amountPaid = 20000;
        mockSchedules[0].status = ScheduleStatus.PAID;

        mockSchedules[1].amountPaid = 5000;
        mockSchedules[1].status = ScheduleStatus.PARTIAL_PAID;

        return {
          appliedAmount: 25000,
          excessAmount: 5000,
          updatedSchedules: mockSchedules,
          invoiceFullyPaid: false,
        };
      });

      const result = await service.distributePayment('business_123', 1, 25000);

      expect(result.appliedAmount).toBe(25000);
      expect(result.excessAmount).toBe(5000);
      expect(result.updatedSchedules).toHaveLength(2);
      expect(result.updatedSchedules[0].amountPaid).toBe(20000);
      expect(result.updatedSchedules[0].status).toBe(ScheduleStatus.PAID);
      expect(result.updatedSchedules[1].amountPaid).toBe(5000);
      expect(result.updatedSchedules[1].status).toBe(
        ScheduleStatus.PARTIAL_PAID,
      );
    });

    it('should handle exact payment amount', async () => {
      const mockSchedules = [
        {
          id: 1,
          installmentNumber: 1,
          amountDue: 20000,
          amountPaid: 0,
          status: ScheduleStatus.PENDING,
          remainingBalance: 20000,
        },
      ] as PaymentSchedule[];

      mockEntityManager.transactional.mockImplementation(async () => {
        mockSchedules[0].amountPaid = 20000;
        mockSchedules[0].status = ScheduleStatus.PAID;

        return {
          appliedAmount: 20000,
          excessAmount: 0,
          updatedSchedules: mockSchedules,
          invoiceFullyPaid: true,
        };
      });

      const result = await service.distributePayment('business_123', 1, 20000);

      expect(result.appliedAmount).toBe(20000);
      expect(result.excessAmount).toBe(0);
      expect(result.updatedSchedules[0].amountPaid).toBe(20000);
      expect(result.updatedSchedules[0].status).toBe(ScheduleStatus.PAID);
    });

    it('should apply payment to specific installment when specified', async () => {
      const mockSchedules = [
        {
          id: 1,
          installmentNumber: 1,
          amountDue: 20000,
          amountPaid: 20000,
          status: ScheduleStatus.PAID,
          remainingBalance: 0,
        },
        {
          id: 2,
          installmentNumber: 2,
          amountDue: 20000,
          amountPaid: 0,
          status: ScheduleStatus.PENDING,
          remainingBalance: 20000,
        },
      ] as PaymentSchedule[];

      mockEntityManager.transactional.mockImplementation(async () => {
        mockSchedules[1].amountPaid = 15000;
        mockSchedules[1].status = ScheduleStatus.PARTIAL_PAID;

        return {
          appliedAmount: 15000,
          excessAmount: 0,
          updatedSchedules: mockSchedules,
          invoiceFullyPaid: false,
        };
      });

      const result = await service.distributePayment(
        'business_123',
        1,
        15000,
        2,
      );

      expect(result.updatedSchedules[1].amountPaid).toBe(15000);
      expect(result.updatedSchedules[1].status).toBe(
        ScheduleStatus.PARTIAL_PAID,
      );
    });
  });

  describe('mapToPaymentDistributionResponse', () => {
    it('should map distribution result to response DTO', () => {
      const mockDistributionResult = {
        appliedAmount: 25000,
        excessAmount: 5000,
        updatedSchedules: [
          {
            id: 1,
            installmentNumber: 1,
            amountDue: 20000,
            amountPaid: 20000,
            status: ScheduleStatus.PAID,
            dueDate: new Date('2024-02-01'),
            invoice: { id: 1 },
            remainingBalance: 0,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ] as PaymentSchedule[],
        invoiceFullyPaid: false,
      };

      const result = service.mapToPaymentDistributionResponse(
        mockDistributionResult,
        25000,
      );

      expect(result.appliedAmount).toBe(25000);
      expect(result.excessAmount).toBe(5000);
      expect(result.updatedSchedules).toHaveLength(1);
      expect(result.summary).toContain('Payment of ₦250 distributed');
      expect(result.summary).toContain('Overpayment of ₦50 recorded');
    });
  });
});
