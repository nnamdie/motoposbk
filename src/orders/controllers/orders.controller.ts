import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';
import { ApiBaseResponse } from '@/common/decorators/base-response.decorator';

import {
  PERMISSIONS,
  RequirePermissions,
} from '../../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { TenantResolveGuard } from '../../auth/guards/tenant-resolve.guard';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import {
  GetTenantContext,
  TenantContext,
} from '../../common/decorators/tenant-context.decorator';
import {
  BaseResponseDto,
  PaginatedResponseDto,
} from '../../common/models/base-response.dto';
import { PaginatedQueryDto } from '../../common/models/paginated-query.dto';
import { CalculateCartRequestDto } from '../models/calculate-cart.request.dto';
import { CalculateCartResponseDto } from '../models/calculate-cart.response.dto';
import { CreateOrderRequestDto } from '../models/create-order.request.dto';
import { CreatePaymentRequestDto } from '../models/create-payment.request.dto';
import { OrderResponseDto } from '../models/order.response.dto';
import { PaymentResponseDto } from '../models/payment.response.dto';
import { OrdersService } from '../services/orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('business/:businessGgId/orders')
@UseGuards(JwtAuthGuard, TenantResolveGuard, PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('calculate-cart')
  @ApiOperation({ summary: 'Calculate cart totals with current item prices' })
  @ApiBaseResponse({
    status: 200,
    description: 'Cart calculated successfully',
    type: CalculateCartResponseDto,
  })
  @RequirePermissions(PERMISSIONS.ORDERS.CREATE)
  async calculateCart(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CalculateCartRequestDto,
  ): Promise<BaseResponseDto<CalculateCartResponseDto>> {
    const result = await this.ordersService.calculateCart(
      currentUser.businessId,
      dto,
    );

    return {
      success: true,
      message: 'Cart calculated successfully',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @RequirePermissions(PERMISSIONS.ORDERS.CREATE)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBaseResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  async createOrder(
    @GetTenantContext() tenantContext: TenantContext,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateOrderRequestDto,
  ): Promise<BaseResponseDto<OrderResponseDto>> {
    const result = await this.ordersService.createOrder(
      tenantContext.businessId,
      dto,
      currentUser.user,
    );

    return {
      success: true,
      message: 'Order created successfully',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @RequirePermissions(PERMISSIONS.ORDERS.READ)
  @ApiOperation({ summary: 'Get all orders' })
  @ApiPaginatedResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: OrderResponseDto,
  })
  async getOrders(
    @GetTenantContext() tenantContext: TenantContext,
    @Query() query: PaginatedQueryDto,
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    const { orders, total } = await this.ordersService.getOrders(
      tenantContext.businessId,
      query,
    );

    return {
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
      meta: {
        page: query.page || 1,
        limit: query.limit || 10,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':orderId')
  @RequirePermissions(PERMISSIONS.ORDERS.READ)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  async getOrderById(
    @GetTenantContext() tenantContext: TenantContext,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<BaseResponseDto<OrderResponseDto>> {
    const result = await this.ordersService.getOrderById(
      tenantContext.businessId,
      orderId,
    );

    return {
      success: true,
      message: 'Order retrieved successfully',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':orderId/installment-payments')
  @RequirePermissions(PERMISSIONS.PAYMENTS.CREATE)
  @ApiOperation({
    summary: 'Create payment for order (installment payments only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
  })
  async createOrderPayment(
    @GetTenantContext() tenantContext: TenantContext,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: CreatePaymentRequestDto,
  ): Promise<BaseResponseDto<PaymentResponseDto>> {
    const result = await this.ordersService.createOrderPayment(
      tenantContext.businessId,
      orderId,
      dto,
      currentUser.user,
    );

    return {
      success: true,
      message: 'Payment created successfully',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
