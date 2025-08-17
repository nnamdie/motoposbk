import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
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
import { CreateExpenseRequestDto } from '../models/create-expense.request.dto';
import { ApproveExpenseRequestDto } from '../models/approve-expense.request.dto';
import { ExpenseResponseDto } from '../models/expense.response.dto';
import { ExpenseService } from '../services/expense.service';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';

@ApiTags('Expenses')
@Controller('business/:businessGgId/expenses')
@UseGuards(TenantResolveGuard, JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.EXPENSES.CREATE)
  @ApiOperation({
    summary: 'Create expense request',
    description: 'Create a new expense request that requires approval',
  })
  @ApiParam({
    name: 'businessGgId',
    description: 'Business identifier',
    example: 'ABC123',
  })
  @ApiResponse({
    status: 201,
    description: 'Expense request created successfully',
    type: ExpenseResponseDto,
  })
  async createExpense(
    @GetTenantContext() tenantContext: TenantContext,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateExpenseRequestDto,
  ): Promise<BaseResponseDto<ExpenseResponseDto>> {
    const result = await this.expenseService.createExpense(
      tenantContext.businessId,
      dto,
      currentUser.member,
    );

    return {
      success: true,
      data: result,
      message: 'Expense request created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @RequirePermissions(PERMISSIONS.EXPENSES.VIEW)
  @ApiOperation({
    summary: 'Get expenses',
    description: 'Retrieve paginated list of expenses with filtering options',
  })
  @ApiParam({
    name: 'businessGgId',
    description: 'Business identifier',
    example: 'ABC123',
  })
  @ApiPaginatedResponse({
    model: ExpenseResponseDto,
    description: 'Expenses retrieved successfully',
  })
  async getExpenses(
    @GetTenantContext() tenantContext: TenantContext,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: PaginatedQueryDto,
  ): Promise<PaginatedResponseDto<ExpenseResponseDto>> {
    const { expenses, total } = await this.expenseService.getExpenses(
      tenantContext.businessId,
      query,
      currentUser.member,
    );

    return {
      success: true,
      data: expenses,
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

  @Get(':id')
  @RequirePermissions(PERMISSIONS.EXPENSES.VIEW)
  @ApiOperation({
    summary: 'Get expense by ID',
    description: 'Retrieve a specific expense by its ID',
  })
  @ApiParam({
    name: 'businessGgId',
    description: 'Business identifier',
    example: 'ABC123',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Expense retrieved successfully',
    type: ExpenseResponseDto,
  })
  async getExpense(
    @GetTenantContext() tenantContext: TenantContext,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BaseResponseDto<ExpenseResponseDto>> {
    const result = await this.expenseService.getExpense(
      tenantContext.businessId,
      id,
      currentUser.member,
    );

    return {
      success: true,
      data: result,
      message: 'Expense retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id/approve')
  @RequirePermissions(PERMISSIONS.EXPENSES.APPROVE)
  @ApiOperation({
    summary: 'Approve or reject expense',
    description: 'Approve or reject an expense request (requires approval permission)',
  })
  @ApiParam({
    name: 'businessGgId',
    description: 'Business identifier',
    example: 'ABC123',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Expense status updated successfully',
    type: ExpenseResponseDto,
  })
  async approveExpense(
    @GetTenantContext() tenantContext: TenantContext,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveExpenseRequestDto,
  ): Promise<BaseResponseDto<ExpenseResponseDto>> {
    const result = await this.expenseService.approveExpense(
      tenantContext.businessId,
      id,
      dto,
      currentUser.member,
    );

    const action = dto.status === 'approved' ? 'approved' : 'rejected';
    return {
      success: true,
      data: result,
      message: `Expense ${action} successfully`,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id/cancel')
  @RequirePermissions(PERMISSIONS.EXPENSES.UPDATE)
  @ApiOperation({
    summary: 'Cancel expense',
    description: 'Cancel an expense request (only by requester or with approval permission)',
  })
  @ApiParam({
    name: 'businessGgId',
    description: 'Business identifier',
    example: 'ABC123',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Expense cancelled successfully',
    type: ExpenseResponseDto,
  })
  async cancelExpense(
    @GetTenantContext() tenantContext: TenantContext,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BaseResponseDto<ExpenseResponseDto>> {
    const result = await this.expenseService.cancelExpense(
      tenantContext.businessId,
      id,
      currentUser.member,
    );

    return {
      success: true,
      data: result,
      message: 'Expense cancelled successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
