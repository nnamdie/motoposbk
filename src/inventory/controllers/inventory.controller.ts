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
import { AddStockRequestDto } from '../models/add-stock.request.dto';
import { CreateItemRequestDto } from '../models/create-item.request.dto';
import { CreateReservationRequestDto } from '../models/create-reservation.request.dto';
import { ItemResponseDto } from '../models/item.response.dto';
import { StockEntryResponseDto } from '../models/stock-entry.response.dto';
import { InventoryService } from '../services/inventory.service';
import { ApiPaginatedResponse } from '@/common/decorators/api-paginated-response.decorator';

@ApiTags('Inventory')
@Controller('business/:businessGgId/inventory')
@UseGuards(TenantResolveGuard, JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('items')
  @RequirePermissions(PERMISSIONS.ITEMS.CREATE)
  @ApiOperation({
    summary: 'Create new item',
    description: 'Create a new inventory item with auto-generated SKU',
  })
  @ApiResponse({
    status: 201,
    description: 'Item created successfully',
    type: ItemResponseDto,
  })
  async createItem(
    @GetTenantContext() tenantContext: TenantContext,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateItemRequestDto,
  ): Promise<BaseResponseDto<ItemResponseDto>> {
    const result = await this.inventoryService.createItem(
      tenantContext.businessId,
      dto,
      currentUser.user,
    );

    return {
      success: true,
      data: result,
      message: 'Item created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('items')
  @RequirePermissions(PERMISSIONS.ITEMS.VIEW)
  @ApiOperation({
    summary: 'Get items',
    description: 'Retrieve paginated list of inventory items',
  })
  @ApiPaginatedResponse({
    model: ItemResponseDto,
    description: 'Items retrieved successfully',
  })
  async getItems(
    @GetTenantContext() tenantContext: TenantContext,
    @Query() query: PaginatedQueryDto,
  ): Promise<PaginatedResponseDto<ItemResponseDto>> {
    const { items, total } = await this.inventoryService.getItems(
      tenantContext.businessId,
      query,
    );

    return {
      success: true,
      data: items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNextPage: query.page < Math.ceil(total / query.limit),
        hasPreviousPage: query.page > 1,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('items/:itemId')
  @RequirePermissions(PERMISSIONS.ITEMS.VIEW)
  @ApiOperation({
    summary: 'Get item by ID',
    description: 'Retrieve a specific inventory item by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Item retrieved successfully',
    type: ItemResponseDto,
  })
  async getItemById(
    @GetTenantContext() tenantContext: TenantContext,
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<BaseResponseDto<ItemResponseDto>> {
    const result = await this.inventoryService.getItemById(
      tenantContext.businessId,
      itemId,
    );

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('items/:itemId/stock')
  @RequirePermissions(PERMISSIONS.INVENTORY.MANAGE)
  @ApiOperation({
    summary: 'Add stock to item',
    description:
      'Add or adjust stock for an inventory item with automatic reservation fulfillment',
  })
  @ApiResponse({
    status: 201,
    description: 'Stock added successfully',
    type: StockEntryResponseDto,
  })
  async addStock(
    @GetTenantContext() tenantContext: TenantContext,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: AddStockRequestDto,
  ): Promise<BaseResponseDto<StockEntryResponseDto>> {
    const result = await this.inventoryService.addStock(
      tenantContext.businessId,
      itemId,
      dto,
      currentUser.user,
    );

    return {
      success: true,
      data: result,
      message: 'Stock updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('reservations')
  @RequirePermissions(PERMISSIONS.INVENTORY.MANAGE)
  @ApiOperation({
    summary: 'Create reservation',
    description: 'Create a stock reservation (pre-order) for an item',
  })
  @ApiResponse({
    status: 201,
    description: 'Reservation created successfully',
  })
  async createReservation(
    @GetTenantContext() tenantContext: TenantContext,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateReservationRequestDto,
  ): Promise<BaseResponseDto<any>> {
    const result = await this.inventoryService.createReservation(
      tenantContext.businessId,
      dto,
      currentUser.user,
    );

    return {
      success: true,
      data: result,
      message: 'Reservation created successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
