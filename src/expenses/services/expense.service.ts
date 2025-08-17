import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PaginatedResponseDto } from '@/common/models/base-response.dto';

import { Member } from '../../auth/entities/member.entity';
import { PaginatedQueryDto } from '../../common/models/paginated-query.dto';
import { Expense } from '../entities/expense.entity';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { ApproveExpenseRequestDto } from '../models/approve-expense.request.dto';
import { CreateExpenseRequestDto } from '../models/create-expense.request.dto';
import { ExpenseResponseDto } from '../models/expense.response.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: EntityRepository<Expense>,
    private readonly em: EntityManager,
  ) {}

  /**
   * Create a new expense request
   */
  async createExpense(
    businessId: string,
    dto: CreateExpenseRequestDto,
    currentMember: Member,
  ): Promise<ExpenseResponseDto> {
    const expense = this.expenseRepository.create({
      business: { ggId: businessId } as any,
      requester: { id: currentMember.id } as any,
      amount: dto.amount,
      notes: dto.notes,
      category: dto.category,
      status: ExpenseStatus.PENDING,
      createdBy: currentMember,
    });

    await this.em.persistAndFlush(expense);

    return this.mapToResponseDto(expense);
  }

  /**
   * Get expenses with pagination and filtering
   */
  async getExpenses(
    businessId: string,
    query: PaginatedQueryDto,
    _currentMember: Member,
  ): Promise<PaginatedResponseDto<ExpenseResponseDto>> {
    const { page = 1, limit = 10, search, status } = query;
    const offset = (page - 1) * limit;

    const filter: any = { business: { ggId: businessId } };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [{ notes: { $ilike: `%${search}%` } }];
    }

    const [expenses, total] = await this.expenseRepository.findAndCount(
      filter,
      {
        limit,
        offset,
        orderBy: { createdAt: 'DESC' as any },
        populate: ['requester.user', 'approver.user'],
      },
    );

    return {
      success: true,
      data: expenses.map((expense) => this.mapToResponseDto(expense)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get a specific expense by ID
   */
  async getExpense(
    businessId: string,
    expenseId: number,
    _currentMember: Member,
  ): Promise<ExpenseResponseDto> {
    const expense = await this.expenseRepository.findOne(
      {
        id: expenseId as any,
        business: { ggId: businessId },
      },
      {
        populate: ['requester.user', 'approver.user'],
      },
    );

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return this.mapToResponseDto(expense);
  }

  /**
   * Approve or reject an expense
   */
  async approveExpense(
    businessId: string,
    expenseId: number,
    dto: ApproveExpenseRequestDto,
    currentMember: Member,
  ): Promise<ExpenseResponseDto> {
    const expense = await this.expenseRepository.findOne(
      {
        id: expenseId as any,
        business: { ggId: businessId },
      },
      {
        populate: ['requester.user', 'approver.user'],
      },
    );

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Validate rejection reason is provided when rejecting
    if (dto.status === ExpenseStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException(
        'Rejection reason is required when rejecting an expense',
      );
    }

    // Update expense status
    expense.status = dto.status;
    expense.approver = currentMember;

    if (dto.status === ExpenseStatus.APPROVED) {
      expense.approvedAt = new Date();
      expense.rejectedAt = undefined;
      expense.rejectionReason = undefined;
    } else if (dto.status === ExpenseStatus.REJECTED) {
      expense.rejectedAt = new Date();
      expense.approvedAt = undefined;
      expense.rejectionReason = dto.rejectionReason;
    }

    await this.em.persistAndFlush(expense);

    return this.mapToResponseDto(expense);
  }

  /**
   * Cancel an expense (only by requester or with approval permission)
   */
  async cancelExpense(
    businessId: string,
    expenseId: number,
    _currentMember: Member,
  ): Promise<ExpenseResponseDto> {
    const expense = await this.expenseRepository.findOne(
      {
        id: expenseId as any,
        business: { ggId: businessId },
      },
      {
        populate: ['requester.user', 'approver.user'],
      },
    );

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    expense.status = ExpenseStatus.CANCELLED;

    await this.em.persistAndFlush(expense);

    return this.mapToResponseDto(expense);
  }

  /**
   * Map expense entity to response DTO
   */
  private mapToResponseDto(expense: Expense): ExpenseResponseDto {
    return {
      id: expense.id as any,
      amount: expense.amount,
      currency: 'NGN', // Default currency
      notes: expense.notes,
      category: expense.category,
      status: expense.status,
      requester: {
        id: expense.requester.id as any,
        fullName: expense.requester.user.fullName,
        phone: expense.requester.user.phone,
      },
      approver: expense.approver
        ? {
            id: expense.approver.id as any,
            fullName: expense.approver.user.fullName,
            phone: expense.approver.user.phone,
          }
        : null,
      requestedAt: expense.createdAt?.toISOString(),
      approvedAt: expense.approvedAt?.toISOString(),
      createdAt: expense.createdAt?.toISOString(),
    };
  }
}
