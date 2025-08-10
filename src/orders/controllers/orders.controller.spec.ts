import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { TenantResolveGuard } from '../../auth/guards/tenant-resolve.guard';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { PaginatedQueryDto } from '../../common/models/paginated-query.dto';
import { InvoiceStatus } from '../enums/invoice-status.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderType } from '../enums/order-type.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';
import { CalculateCartRequestDto } from '../models/calculate-cart.request.dto';
import { CreateOrderRequestDto } from '../models/create-order.request.dto';
import { CreatePaymentRequestDto } from '../models/create-payment.request.dto';
import { OrdersService } from '../services/orders.service';
import { OrdersController } from './orders.controller';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: jest.Mocked<OrdersService>;

  const mockUser: AuthenticatedUser = {
    id: 1,
    phone: '+2348012345678',
    businessId: 'business_123',
    memberId: 1,
    isOwner: true,
    roles: ['owner'],
    permissions: ['orders:create', 'orders:read'],
    user: {} as any,
    member: {} as any,
  };

  const mockTenantContext: TenantContext = {
    businessGgId: 'business_123',
    businessId: 'business_123',
    businessName: 'Test Business',
    businessStatus: 'active',
  };

  const mockCreateOrderDto: CreateOrderRequestDto = {
    customer: {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+2348012345678',
      address: '123 Test St',
    },
    items: [
      {
        itemId: 1,
        quantity: 2,
      },
    ],
    type: OrderType.REGULAR,
    paymentMethod: PaymentMethod.CASH,
    paymentType: PaymentType.ONE_TIME,
    notes: 'Test order',
  };

  const mockCalculateCartDto: CalculateCartRequestDto = {
    items: [
      {
        itemId: 1,
        quantity: 2,
      },
    ],
  };

  const mockCreatePaymentDto: CreatePaymentRequestDto = {
    amount: 10000,
    method: PaymentMethod.CASH,
    reference: 'PAY_123',
    notes: 'Test payment',
  };

  const mockOrderResponse = {
    id: 1,
    orderNumber: 'ORD_001',
    businessId: 'business_123',
    customer: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+2348012345678',
    },
    items: [
      {
        id: 1,
        itemId: 1,
        itemName: 'Test Item',
        quantity: 2,
        unitPrice: 5000,
        totalPrice: 10000,
      },
    ],
    type: OrderType.REGULAR,
    status: OrderStatus.CONFIRMED,
    subtotal: 10000,
    taxAmount: 0,
    discountAmount: 0,
    total: 10000,
    currency: 'NGN',
    paymentMethod: PaymentMethod.CASH,
    paymentType: PaymentType.ONE_TIME,
    invoice: {
      id: 1,
      invoiceNumber: 'INV_001',
      status: InvoiceStatus.PAID,
      total: 10000,
      paidAmount: 10000,
      balanceAmount: 0,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaymentResponse = {
    id: 1,
    paymentNumber: 'PAY_001',
    invoiceId: 1,
    amount: 10000,
    method: PaymentMethod.CASH,
    status: PaymentStatus.COMPLETED,
    reference: 'PAY_123',
    createdAt: new Date(),
  };

  const mockCalculateCartResponse = {
    items: [
      {
        itemId: 1,
        itemSku: 'TEST_001',
        itemName: 'Test Item',
        quantity: 2,
        unitPrice: 5000,
        lineTotal: 10000,
        inStock: true,
        availableStock: 50,
        isPreOrder: false,
      },
    ],
    subtotal: 10000,
    taxAmount: 0,
    discountAmount: 0,
    shippingAmount: 0,
    total: 10000,
    currency: 'NGN',
    hasPreOrderItems: false,
    unavailableItemsCount: 0,
  };

  beforeEach(async () => {
    const mockOrdersService = {
      calculateCart: jest.fn(),
      createOrder: jest.fn(),
      getOrders: jest.fn(),
      getOrderById: jest.fn(),
      createOrderPayment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TenantResolveGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('calculateCart', () => {
    it('should calculate cart successfully', async () => {
      ordersService.calculateCart.mockResolvedValue(mockCalculateCartResponse);

      const result = await controller.calculateCart(
        mockUser,
        mockCalculateCartDto,
      );

      expect(ordersService.calculateCart).toHaveBeenCalledWith(
        mockUser.businessId,
        mockCalculateCartDto,
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Cart calculated successfully');
      expect(result.data).toEqual(mockCalculateCartResponse);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle cart calculation errors', async () => {
      const error = new Error('Item not found');

      ordersService.calculateCart.mockRejectedValue(error);

      await expect(
        controller.calculateCart(mockUser, mockCalculateCartDto),
      ).rejects.toThrow(error);

      expect(ordersService.calculateCart).toHaveBeenCalledWith(
        mockUser.businessId,
        mockCalculateCartDto,
      );
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      ordersService.createOrder.mockResolvedValue(mockOrderResponse as any);

      const result = await controller.createOrder(
        mockTenantContext,
        mockUser,
        mockCreateOrderDto,
      );

      expect(ordersService.createOrder).toHaveBeenCalledWith(
        mockTenantContext.businessId,
        mockCreateOrderDto,
        mockUser.user,
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Order created successfully');
      expect(result.data).toEqual(mockOrderResponse);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle order creation errors', async () => {
      const error = new Error('Insufficient stock');

      ordersService.createOrder.mockRejectedValue(error);

      await expect(
        controller.createOrder(mockTenantContext, mockUser, mockCreateOrderDto),
      ).rejects.toThrow(error);

      expect(ordersService.createOrder).toHaveBeenCalledWith(
        mockTenantContext.businessId,
        mockCreateOrderDto,
        mockUser.user,
      );
    });
  });

  describe('getOrders', () => {
    it('should get orders successfully', async () => {
      const mockOrders = { orders: [mockOrderResponse], total: 1 };

      ordersService.getOrders.mockResolvedValue(mockOrders as any);

      const query = Object.assign(new PaginatedQueryDto(), {
        page: 1,
        limit: 10,
      });
      const result = await controller.getOrders(mockTenantContext, query);

      expect(ordersService.getOrders).toHaveBeenCalledWith(
        mockTenantContext.businessId,
        query,
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Orders retrieved successfully');
      expect(result.data).toEqual(mockOrders);
    });

    it('should handle get orders errors', async () => {
      const error = new Error('Database error');

      ordersService.getOrders.mockRejectedValue(error);

      const query = Object.assign(new PaginatedQueryDto(), {
        page: 1,
        limit: 10,
      });

      await expect(
        controller.getOrders(mockTenantContext, query),
      ).rejects.toThrow(error);
    });
  });

  describe('getOrderById', () => {
    it('should get order by id successfully', async () => {
      ordersService.getOrderById.mockResolvedValue(mockOrderResponse as any);

      const result = await controller.getOrderById(mockTenantContext, 1);

      expect(ordersService.getOrderById).toHaveBeenCalledWith(
        mockTenantContext.businessId,
        1,
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Order retrieved successfully');
      expect(result.data).toEqual(mockOrderResponse);
    });

    it('should handle get order by id errors', async () => {
      const error = new Error('Order not found');

      ordersService.getOrderById.mockRejectedValue(error);

      await expect(
        controller.getOrderById(mockTenantContext, 1),
      ).rejects.toThrow(error);
    });
  });

  describe('createOrderPayment', () => {
    it('should create order payment successfully', async () => {
      ordersService.createOrderPayment.mockResolvedValue(
        mockPaymentResponse as any,
      );

      const result = await controller.createOrderPayment(
        mockTenantContext,
        mockUser,
        1,
        mockCreatePaymentDto,
      );

      expect(ordersService.createOrderPayment).toHaveBeenCalledWith(
        mockTenantContext.businessId,
        1,
        mockCreatePaymentDto,
        mockUser.user,
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment created successfully');
      expect(result.data).toEqual(mockPaymentResponse);
    });

    it('should handle order payment creation errors', async () => {
      const error = new Error('Order not found');

      ordersService.createOrderPayment.mockRejectedValue(error);

      await expect(
        controller.createOrderPayment(
          mockTenantContext,
          mockUser,
          1,
          mockCreatePaymentDto,
        ),
      ).rejects.toThrow(error);
    });
  });
});
