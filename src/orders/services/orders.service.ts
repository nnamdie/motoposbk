import { EntityManager, EntityRepository, LockMode } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { User } from '../../auth/entities/user.entity';
import { PaginatedQueryDto } from '../../common/models/paginated-query.dto';
import { generateReference } from '../../common/utils/helpers';
import { Item } from '../../inventory/entities/item.entity';
import { Reservation } from '../../inventory/entities/reservation.entity';
import { ReservationStatus } from '../../inventory/enums/reservation-status.enum';
import { ReservationType } from '../../inventory/enums/reservation-type.enum';
import { Customer } from '../entities/customer.entity';
import { Invoice } from '../entities/invoice.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Payment } from '../entities/payment.entity';
import { PaymentSchedule } from '../entities/payment-schedule.entity';
import { InvoiceStatus } from '../enums/invoice-status.enum';
import { InvoiceType } from '../enums/invoice-type.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderType } from '../enums/order-type.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';
import { CalculateCartRequestDto } from '../models/calculate-cart.request.dto';
import { CalculateCartResponseDto } from '../models/calculate-cart.response.dto';
import { CreateInvoiceRequestDto } from '../models/create-invoice.request.dto';
import { CreateOrderRequestDto } from '../models/create-order.request.dto';
import { CreatePaymentRequestDto } from '../models/create-payment.request.dto';
import { CustomerInfoDto } from '../models/customer-info.request.dto';
import { InstallmentPlan } from '../models/installment-plan.interface';
import { InvoiceResponseDto } from '../models/invoice.response.dto';
import { OrderResponseDto } from '../models/order.response.dto';
import { OrderItemRequestDto } from '../models/order-item.request.dto';
import { PaymentResponseDto } from '../models/payment.response.dto';
import { PaymentDistributionResponseDto } from '../models/payment-distribution.response.dto';
import { PaymentProviderService } from './payment-provider.service';
import { PaymentScheduleService } from './payment-schedule.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: EntityRepository<Customer>,
    @InjectRepository(Order)
    private readonly orderRepository: EntityRepository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: EntityRepository<OrderItem>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: EntityRepository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepository: EntityRepository<Payment>,
    @InjectRepository(Item)
    private readonly itemRepository: EntityRepository<Item>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: EntityRepository<Reservation>,
    @InjectRepository(PaymentSchedule)
    private readonly scheduleRepository: EntityRepository<PaymentSchedule>,
    private readonly em: EntityManager,
    private readonly paymentProviderService: PaymentProviderService,
    private readonly paymentScheduleService: PaymentScheduleService,
  ) {}

  async calculateCart(
    businessId: string,
    dto: CalculateCartRequestDto,
  ): Promise<CalculateCartResponseDto> {
    // Validate and get items with current prices
    const itemIds = dto.items.map((item) => item.itemId);
    const items = await this.itemRepository.find({
      id: { $in: itemIds },
      business: { ggId: businessId },
    });

    if (items.length !== itemIds.length) {
      throw new BadRequestException('Some items not found');
    }

    let subtotal = 0;
    let hasPreOrderItems = false;
    let unavailableItemsCount = 0;

    const cartItems = dto.items
      .map((cartItem) => {
        const item = items.find((i) => i.id === cartItem.itemId);

        if (!item) {
          unavailableItemsCount++;
          return null;
        }

        const lineTotal = item.sellingPrice * cartItem.quantity;

        subtotal += lineTotal;

        const inStock = item.availableStock >= cartItem.quantity;
        const isPreOrder = !inStock;

        if (isPreOrder) {
          hasPreOrderItems = true;
        }

        return {
          itemId: item.id,
          itemSku: item.sku,
          itemName: item.name,
          unitPrice: item.sellingPrice,
          quantity: cartItem.quantity,
          availableStock: item.availableStock,
          lineTotal,
          inStock,
          isPreOrder,
        };
      })
      .filter(Boolean) as any[];

    const taxAmount = dto.taxAmount || 0;
    const discountAmount = dto.discountAmount || 0;
    const shippingAmount = dto.shippingAmount || 0;
    const total = subtotal + taxAmount + shippingAmount - discountAmount;

    return {
      items: cartItems,
      subtotal,
      taxAmount,
      discountAmount,
      shippingAmount,
      total,
      currency: 'NGN',
      hasPreOrderItems,
      unavailableItemsCount,
    };
  }

  async createOrder(
    businessId: string,
    dto: CreateOrderRequestDto,
    createdBy: User,
  ): Promise<OrderResponseDto> {
    return await this.em.transactional(async (em) => {
      // Find or create customer
      const customer = await this.findOrCreateCustomer(
        businessId,
        dto.customer,
        createdBy,
        em,
      );

      // Validate and lock items with current prices (no price injection)
      const itemsData = await this.validateAndLockItems(
        businessId,
        dto.items,
        em,
      );

      // Calculate totals using actual item prices
      const { subtotal, isPreOrder } = this.calculateOrderTotalsFromItems(
        itemsData,
        dto.items,
      );
      const taxAmount = dto.taxAmount || 0;
      const discountAmount = dto.discountAmount || 0;
      const shippingAmount = dto.shippingAmount || 0;
      const total = subtotal + taxAmount + shippingAmount - discountAmount;

      // Create order
      const order = em.create(Order, {
        business: { ggId: businessId },
        orderNumber: generateReference('ORD'),
        customer,
        type:
          dto.type || (isPreOrder ? OrderType.PRE_ORDER : OrderType.REGULAR),
        status: OrderStatus.PENDING,
        subtotal,
        taxAmount,
        discountAmount,
        shippingAmount,
        total,
        isPreOrder,
        notes: dto.notes,
        deliveryAddress: dto.deliveryAddress,
        expectedDeliveryDate: dto.expectedDeliveryDate
          ? new Date(dto.expectedDeliveryDate)
          : undefined,
        createdBy,
      });

      await em.persistAndFlush(order);

      // Create order items and handle stock allocation
      await Promise.all([
        this.createOrderItems(
          businessId,
          order,
          itemsData,
          dto.items,
          createdBy,
          em,
        ),
        this.processOrderPayment(businessId, order, dto, createdBy, em),
      ]);

      // Load order with relations
      await em.populate(order, ['customer', 'items']);

      // Load all payments for this order (for installments)
      const payments = await this.paymentRepository.find({
        invoice: {
          $in: await this.invoiceRepository
            .find({ order })
            .then((invoices) => invoices.map((i) => i.id)),
        },
        business: { ggId: businessId },
      });

      // Load payment schedule if exists
      const invoices = await this.invoiceRepository.find({ order });
      let paymentSchedule: PaymentSchedule[] = [];

      if (invoices.length > 0) {
        paymentSchedule = await this.scheduleRepository.find({
          business: { ggId: businessId },
          invoice: invoices[0],
        });
      }

      return await this.mapToOrderResponse(order, payments, paymentSchedule);
    });
  }

  async getOrders(
    businessId: string,
    query: PaginatedQueryDto,
  ): Promise<{ orders: OrderResponseDto[]; total: number }> {
    const [orders, total] = await this.orderRepository.findAndCount(
      {
        business: { ggId: businessId },
        ...(query.search && {
          $or: [
            { orderNumber: { $ilike: `%${query.search}%` } },
            { customer: { firstName: { $ilike: `%${query.search}%` } } },
            { customer: { lastName: { $ilike: `%${query.search}%` } } },
            { customer: { phone: { $ilike: `%${query.search}%` } } },
          ],
        }),
      },
      {
        populate: ['customer', 'items'],
        limit: query.limit,
        offset: query.offset,
        orderBy: { [query.sortBy]: query.sortOrder },
      },
    );

    const orderResponses = await Promise.all(
      orders.map(async (order) => {
        // Load payment schedule for each order
        const invoices = await this.invoiceRepository.find({
          order,
        });
        let paymentSchedule: PaymentSchedule[] = [];

        if (invoices.length > 0) {
          paymentSchedule = await this.scheduleRepository.find({
            business: { ggId: businessId },
            invoice: invoices[0],
          });
        }
        return await this.mapToOrderResponse(order, undefined, paymentSchedule);
      }),
    );

    return {
      orders: orderResponses,
      total,
    };
  }

  async getOrderById(
    businessId: string,
    orderId: number,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne(
      {
        id: orderId,
        business: { ggId: businessId },
      },
      {
        populate: ['customer', 'items'],
      },
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Load payment schedule
    const invoices = await this.invoiceRepository.find({ order });
    let paymentSchedule: PaymentSchedule[] = [];

    if (invoices.length > 0) {
      paymentSchedule = await this.scheduleRepository.find({
        business: { ggId: businessId },
        invoice: invoices[0],
      });
    }

    return await this.mapToOrderResponse(order, undefined, paymentSchedule);
  }

  async createInvoice(
    businessId: string,
    orderId: number,
    dto: CreateInvoiceRequestDto,
    createdBy: User,
  ): Promise<InvoiceResponseDto> {
    const order = await this.orderRepository.findOne(
      {
        id: orderId,
        business: { ggId: businessId },
      },
      {
        populate: ['customer'],
      },
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if invoice already exists for this order
    const existingInvoice = await this.invoiceRepository.findOne({
      order,
      business: { ggId: businessId },
    });

    if (existingInvoice) {
      throw new BadRequestException('Invoice already exists for this order');
    }

    const invoice = this.invoiceRepository.create({
      business: businessId,
      invoiceNumber: generateReference('INV'),
      order,
      customer: order.customer,
      type: dto.type || InvoiceType.STANDARD,
      status: InvoiceStatus.DRAFT,
      issueDate: new Date(),
      dueDate: new Date(dto.dueDate),
      subtotal: order.subtotal,
      taxAmount: dto.taxAmount ?? order.taxAmount,
      discountAmount: dto.discountAmount ?? order.discountAmount,
      shippingAmount: dto.shippingAmount ?? order.shippingAmount,
      total: order.total,
      balanceAmount: order.total,
      notes: dto.notes,
      terms: dto.terms,
      createdBy,
    });

    await this.em.persistAndFlush(invoice);

    return this.mapToInvoiceResponse(invoice);
  }

  async createOrderPayment(
    businessId: string,
    orderId: number,
    dto: CreatePaymentRequestDto,
    createdBy: User,
  ): Promise<PaymentResponseDto> {
    // Find the order and its invoice
    const order = await this.orderRepository.findOne({
      id: orderId,
      business: { ggId: businessId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Find the invoice for this order
    const invoice = await this.invoiceRepository.findOne(
      {
        order,
        business: { ggId: businessId },
      },
      {
        populate: ['customer'],
      },
    );

    if (!invoice) {
      throw new NotFoundException('Invoice not found for this order');
    }

    // Use the existing createPayment method
    return this.createPayment(businessId, invoice.id, dto, createdBy);
  }

  async createPayment(
    businessId: string,
    invoiceId: number,
    dto: CreatePaymentRequestDto,
    createdBy: User,
  ): Promise<PaymentResponseDto> {
    return await this.em.transactional(async (em) => {
      const invoice = await em.findOne(
        Invoice,
        {
          id: invoiceId,
          business: { ggId: businessId },
        },
        {
          populate: ['customer'],
        },
      );

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      if (dto.amount > invoice.balanceAmount) {
        throw new BadRequestException('Payment amount exceeds invoice balance');
      }

      // Determine payment type based on whether invoice has payment schedules
      const existingSchedules = await em.find(PaymentSchedule, {
        business: { ggId: businessId },
        invoice: invoice,
      });
      const paymentType =
        existingSchedules.length > 0
          ? PaymentType.INSTALLMENT
          : PaymentType.ONE_TIME;

      let bankDetails: any = null;
      let provider: string | undefined;

      // For bank transfer payments, generate bank details
      if (dto.method === PaymentMethod.BANK_TRANSFER) {
        const paymentReference = generateReference('PAY');

        const bankTransferRequest = {
          amount: dto.amount,
          currency: invoice.currency,
          customerName: invoice.customer.fullName,
          customerPhone: invoice.customer.phone,
          reference: paymentReference,
          description: `Payment for Invoice ${invoice.invoiceNumber}`,
          expiryMinutes: 60 * 24, // 24 hours
          // Add required metadata for payment context
          metadata: {
            invoiceId: invoice.id,
            orderId: invoice.order.id,
            paymentType: (paymentType === PaymentType.INSTALLMENT
              ? 'Installment'
              : 'OneTime') as 'OneTime' | 'DownPayment' | 'Installment',
            expectedAmount: dto.amount,
            businessId: businessId,
          },
        };

        const result =
          await this.paymentProviderService.generateBankDetails(
            bankTransferRequest,
          );

        bankDetails = result.bankDetails;
        provider = result.provider;
      }

      const payment = em.create(Payment, {
        business: invoice.business,
        paymentNumber: generateReference('PAY'),
        invoice,
        customer: invoice.customer,
        amount: dto.amount,
        method: dto.method,
        type: paymentType,
        status:
          dto.method === PaymentMethod.CASH
            ? PaymentStatus.COMPLETED
            : PaymentStatus.PENDING,
        provider,
        externalReference: dto.externalReference,
        reference: dto.reference,
        notes: dto.notes,
        paidAt: dto.method === PaymentMethod.CASH ? new Date() : undefined,
        // Bank transfer details
        bankName: bankDetails?.bankName,
        accountNumber: bankDetails?.accountNumber,
        accountName: bankDetails?.accountName,
        bankDetailsExpiryDate: bankDetails?.expiryDate,
        createdBy,
      });

      await em.persistAndFlush(payment);

      let distributionResponse: PaymentDistributionResponseDto | undefined;

      // Only update invoice amounts for completed payments (cash)
      if (dto.method === PaymentMethod.CASH) {
        if (paymentType === PaymentType.INSTALLMENT) {
          // Distribute payment across schedules with overpayment handling
          const distributionResult =
            await this.paymentScheduleService.distributePayment(
              businessId,
              invoice.id,
              dto.amount,
            );

          // Convert to response DTO
          distributionResponse =
            this.paymentScheduleService.mapToPaymentDistributionResponse(
              distributionResult,
              dto.amount,
            );

          this.logger.log(distributionResponse.summary);

          // Handle excess amount (overpayment)
          if (distributionResult.excessAmount > 0) {
            payment.notes =
              (payment.notes || '') +
              `\nOverpayment of ₦${distributionResult.excessAmount.toLocaleString()} recorded`;
          }

          // Update invoice amounts based on schedule distribution
          const updatedSchedules = await em.find(PaymentSchedule, {
            business: { ggId: businessId },
            invoice: invoice,
          });

          const totalPaid = updatedSchedules.reduce(
            (sum, s) => sum + s.amountPaid,
            0,
          );

          invoice.paidAmount = totalPaid;
          invoice.balanceAmount = invoice.total - totalPaid;

          if (distributionResult.invoiceFullyPaid) {
            invoice.status = InvoiceStatus.PAID;
            invoice.paidAt = new Date();
          } else if (invoice.paidAmount > 0) {
            invoice.status = InvoiceStatus.PARTIAL_PAID;
          }
        } else {
          // No payment schedule, handle as regular payment
          invoice.paidAmount += dto.amount;
          invoice.balanceAmount = invoice.total - invoice.paidAmount;

          if (invoice.balanceAmount <= 0) {
            invoice.status = InvoiceStatus.PAID;
            invoice.paidAt = new Date();
          } else if (invoice.paidAmount > 0) {
            invoice.status = InvoiceStatus.PARTIAL_PAID;
          }
        }

        await em.persistAndFlush(invoice);
      }

      const baseResponse = this.mapToPaymentResponse(payment);

      // Return enhanced response with distribution info
      return {
        ...baseResponse,
        distribution: distributionResponse,
      };
    });
  }

  private async processOrderPayment(
    businessId: string,
    order: Order,
    dto: CreateOrderRequestDto,
    createdBy: User,
    em: EntityManager,
  ): Promise<Payment> {
    // Validate installment payment requirements
    if (dto.paymentType === PaymentType.INSTALLMENT) {
      if (!dto.installmentFrequency) {
        throw new BadRequestException(
          'Installment frequency is required for installment payments',
        );
      }
      if (!dto.numberOfInstallments || dto.numberOfInstallments < 2) {
        throw new BadRequestException(
          'Number of installments is required and must be at least 2',
        );
      }
      if (dto.numberOfInstallments > 24) {
        throw new BadRequestException(
          'Number of installments cannot exceed 24',
        );
      }
      if (!dto.downPaymentAmount || dto.downPaymentAmount <= 0) {
        throw new BadRequestException(
          'Down payment amount is required for installment payments',
        );
      }
      if (dto.downPaymentAmount >= order.total) {
        throw new BadRequestException(
          'Down payment amount cannot be equal to or greater than order total',
        );
      }
    }
    // Create invoice first
    const invoice = em.create(Invoice, {
      business: order.business,
      invoiceNumber: generateReference('INV'),
      order,
      customer: order.customer,
      type: InvoiceType.STANDARD,
      status: InvoiceStatus.DRAFT,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      shippingAmount: order.shippingAmount,
      total: order.total,
      balanceAmount: order.total,
      createdBy,
    });

    await em.persistAndFlush(invoice);

    // Determine payment amount
    let paymentAmount = order.total;

    if (dto.paymentType === PaymentType.INSTALLMENT && dto.downPaymentAmount) {
      paymentAmount = dto.downPaymentAmount;
    }

    let bankDetails: any = null;
    let provider: string | undefined;

    // For bank transfer payments, generate bank details
    if (dto.paymentMethod === PaymentMethod.BANK_TRANSFER) {
      const paymentReference = generateReference('PAY');

      const bankTransferRequest = {
        amount: paymentAmount,
        currency: order.currency,
        customerName: order.customer.fullName,
        customerPhone: order.customer.phone,
        reference: paymentReference,
        description: `Payment for Order ${order.orderNumber}`,
        expiryMinutes: 60 * 24, // 24 hours
        // NEW: Add metadata for payment context
        metadata: {
          invoiceId: invoice.id,
          orderId: order.id,
          paymentType: (dto.paymentType === PaymentType.INSTALLMENT
            ? 'DownPayment'
            : 'OneTime') as 'OneTime' | 'DownPayment' | 'Installment',
          expectedAmount: paymentAmount,
          businessId: businessId,
        },
      };

      const result =
        await this.paymentProviderService.generateBankDetails(
          bankTransferRequest,
        );

      bankDetails = result.bankDetails;
      provider = result.provider;
    }

    const payment = em.create(Payment, {
      business: order.business,
      paymentNumber: generateReference('PAY'),
      invoice,
      customer: order.customer,
      amount: paymentAmount,
      method: dto.paymentMethod,
      type: dto.paymentType,
      status:
        dto.paymentMethod === PaymentMethod.CASH
          ? PaymentStatus.COMPLETED
          : PaymentStatus.PENDING,
      provider,
      // Bank transfer details
      bankName: bankDetails?.bankName,
      accountNumber: bankDetails?.accountNumber,
      accountName: bankDetails?.accountName,
      bankDetailsExpiryDate: bankDetails?.expiryDate,
      paidAt: dto.paymentMethod === PaymentMethod.CASH ? new Date() : undefined,
      createdBy,
    });

    await em.persistAndFlush(payment);

    // Generate payment schedule for installments
    if (
      dto.paymentType === PaymentType.INSTALLMENT &&
      dto.installmentFrequency
    ) {
      const installmentPlan: InstallmentPlan = {
        totalAmount: order.total,
        downPaymentAmount: paymentAmount,
        frequency: dto.installmentFrequency,
        numberOfInstallments: dto.numberOfInstallments,
        startDate: new Date(),
      };

      await this.paymentScheduleService.generatePaymentSchedule(
        businessId,
        invoice,
        installmentPlan,
        createdBy,
        em,
      );

      this.logger.log(
        `Generated payment schedule for invoice ${invoice.invoiceNumber} ` +
          `with ${dto.installmentFrequency} frequency`,
      );
    }

    // Update invoice for completed cash payments
    if (dto.paymentMethod === PaymentMethod.CASH) {
      if (dto.paymentType === PaymentType.INSTALLMENT) {
        // For installment cash payments, distribute across schedule
        await this.paymentScheduleService.distributePayment(
          businessId,
          invoice.id,
          paymentAmount,
          1, // Apply to first installment
        );
      } else {
        // For one-time cash payments, mark invoice as paid
        invoice.paidAmount = paymentAmount;
        invoice.balanceAmount = invoice.total - paymentAmount;

        if (invoice.balanceAmount <= 0) {
          invoice.status = InvoiceStatus.PAID;
          invoice.paidAt = new Date();
        } else {
          invoice.status = InvoiceStatus.PARTIAL_PAID;
        }

        await em.persistAndFlush(invoice);
      }
    }

    return payment;
  }

  private async findOrCreateCustomer(
    businessId: string,
    customerInfo: CustomerInfoDto,
    createdBy: User,
    em: EntityManager,
  ): Promise<Customer> {
    // Try to find existing customer by phone
    let customer = await em.findOne(Customer, {
      business: { ggId: businessId },
      phone: customerInfo.phone,
    });

    if (!customer) {
      // Create new customer
      customer = em.create(Customer, {
        business: { ggId: businessId },
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        phone: customerInfo.phone,
        address: customerInfo.address,
        createdBy,
      });

      await em.persistAndFlush(customer);
    }

    return customer;
  }

  private async validateAndLockItems(
    businessId: string,
    orderItems: OrderItemRequestDto[],
    em: EntityManager,
  ): Promise<Item[]> {
    const itemIds = orderItems.map((item) => item.itemId);

    const items = await em.find(
      Item,
      {
        id: { $in: itemIds },
        business: { ggId: businessId },
      },
      {
        lockMode: LockMode.PESSIMISTIC_WRITE,
      },
    );

    if (items.length !== itemIds.length) {
      throw new BadRequestException('Some items not found');
    }

    return items;
  }

  private calculateOrderTotalsFromItems(
    items: Item[],
    orderItems: OrderItemRequestDto[],
  ): { subtotal: number; isPreOrder: boolean } {
    let subtotal = 0;
    let isPreOrder = false;

    for (const orderItem of orderItems) {
      const item = items.find((i) => i.id === orderItem.itemId);

      if (!item) continue;

      // Use actual item price (no price injection allowed)
      const unitPrice = item.sellingPrice;
      const lineTotal = orderItem.quantity * unitPrice;

      subtotal += lineTotal;

      // Check if item requires pre-order
      if (item.availableStock < orderItem.quantity) {
        isPreOrder = true;
      }
    }

    return { subtotal, isPreOrder };
  }

  private async createOrderItems(
    businessId: string,
    order: Order,
    items: Item[],
    orderItemsData: OrderItemRequestDto[],
    createdBy: User,
    em: EntityManager,
  ): Promise<OrderItem[]> {
    const orderItems: OrderItem[] = [];

    for (const orderItemData of orderItemsData) {
      const item = items.find((i) => i.id === orderItemData.itemId);

      if (!item) continue;

      // Use actual item price (no price injection allowed)
      const unitPrice = item.sellingPrice;
      const lineTotal = orderItemData.quantity * unitPrice;
      const isPreOrder = item.availableStock < orderItemData.quantity;

      const orderItem = em.create(OrderItem, {
        business: order.business,
        order,
        item,
        itemSku: item.sku,
        itemName: item.name,
        quantity: orderItemData.quantity,
        unitPrice,
        discountAmount: 0,
        lineTotal,
        isPreOrder,
        notes: orderItemData.notes,
        createdBy,
      });

      // Handle stock allocation
      if (isPreOrder) {
        // Create reservation for out-of-stock items
        const reservation = em.create(Reservation, {
          business: order.business,
          item,
          quantity: orderItemData.quantity - item.availableStock,
          type: ReservationType.ORDER,
          status: ReservationStatus.ACTIVE,
          reference: order.orderNumber,
          reservedBy: createdBy,
          createdBy,
        });

        await em.persistAndFlush(reservation);

        // Reserve available stock
        if (item.availableStock > 0) {
          const reservedQty = Math.min(
            item.availableStock,
            orderItemData.quantity,
          );

          item.reservedStock += reservedQty;
          orderItem.reservedQuantity = reservedQty;
          orderItem.fulfilledQuantity = reservedQty;
        }
      } else {
        // Reserve full quantity from available stock
        item.reservedStock += orderItemData.quantity;
        orderItem.reservedQuantity = orderItemData.quantity;
        orderItem.fulfilledQuantity = orderItemData.quantity;
      }

      await em.persistAndFlush([item, orderItem]);
      orderItems.push(orderItem);
    }

    return orderItems;
  }

  private async mapToOrderResponse(
    order: Order,
    payments?: Payment[],
    paymentSchedule?: PaymentSchedule[],
  ): Promise<OrderResponseDto> {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        id: order.customer.id,
        firstName: order.customer.firstName,
        lastName: order.customer.lastName,
        phone: order.customer.phone,
        fullName: order.customer.fullName,
      },
      type: order.type,
      status: order.status,
      items: order.items.getItems().map((item) => ({
        id: item.id,
        itemId: item.item.id,
        itemSku: item.itemSku,
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount,
        lineTotal: item.lineTotal,
        currency: item.currency,
        isPreOrder: item.isPreOrder,
        reservedQuantity: item.reservedQuantity,
        fulfilledQuantity: item.fulfilledQuantity,
        remainingQuantity: item.remainingQuantity,
        isFullyFulfilled: item.isFullyFulfilled,
        notes: item.notes,
      })),
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      shippingAmount: order.shippingAmount,
      total: order.total,
      currency: order.currency,
      isPreOrder: order.isPreOrder,
      notes: order.notes,
      deliveryAddress: order.deliveryAddress,
      expectedDeliveryDate: order.expectedDeliveryDate?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
      canBeCancelled: order.canBeCancelled,
      isCompleted: order.isCompleted,
      isCancelled: order.isCancelled,
      payments: payments?.map((payment) => ({
        id: payment.id,
        paymentNumber: payment.paymentNumber,
        method: payment.method,
        type: payment.type,
        status: payment.status,
        amount: payment.amount,
        bankName: payment.bankName,
        accountNumber: payment.accountNumber,
        accountName: payment.accountName,
        bankDetailsExpiryDate: payment.bankDetailsExpiryDate?.toISOString(),
        paidAt: payment.paidAt?.toISOString(),
      })),
      paymentSchedule: paymentSchedule?.map((schedule) =>
        this.paymentScheduleService.mapToPaymentScheduleResponse(schedule),
      ),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  private mapToInvoiceResponse(invoice: Invoice): InvoiceResponseDto {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      orderId: invoice.order.id,
      orderNumber: invoice.order.orderNumber,
      customerId: invoice.customer.id,
      customerName: invoice.customer.fullName,
      customerPhone: invoice.customer.phone,
      type: invoice.type,
      status: invoice.status,
      issueDate: invoice.issueDate.toISOString().split('T')[0],
      dueDate: invoice.dueDate.toISOString().split('T')[0],
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      shippingAmount: invoice.shippingAmount,
      total: invoice.total,
      paidAmount: invoice.paidAmount,
      balanceAmount: invoice.balanceAmount,
      currency: invoice.currency,
      notes: invoice.notes,
      terms: invoice.terms,
      sentAt: invoice.sentAt?.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      isFullyPaid: invoice.isFullyPaid,
      isOverdue: invoice.isOverdue,
      canBeVoided: invoice.canBeVoided,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    };
  }

  private mapToPaymentResponse(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      paymentNumber: payment.paymentNumber,
      invoiceId: payment.invoice.id,
      invoiceNumber: payment.invoice.invoiceNumber,
      customerId: payment.customer.id,
      customerName: payment.customer.fullName,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      type: payment.type,
      status: payment.status,
      externalReference: payment.externalReference,
      providerTransactionId: payment.providerTransactionId,
      provider: payment.provider,
      bankName: payment.bankName,
      accountNumber: payment.accountNumber,
      accountName: payment.accountName,
      bankDetailsExpiryDate: payment.bankDetailsExpiryDate?.toISOString(),
      reference: payment.reference,
      notes: payment.notes,
      paidAt: payment.paidAt?.toISOString(),
      failedAt: payment.failedAt?.toISOString(),
      failureReason: payment.failureReason,
      refundedAmount: payment.refundedAmount,
      refundedAt: payment.refundedAt?.toISOString(),
      isSuccessful: payment.isSuccessful,
      isFailed: payment.isFailed,
      isRefunded: payment.isRefunded,
      refundableAmount: payment.refundableAmount,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
  }
}
