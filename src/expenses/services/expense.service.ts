import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';

import { Expense } from '../entities/expense.entity';
import { Member } from '../../auth/entities/member.entity';
import { CreateExpenseRequestDto } from '../models/create-expense.request.dto';
import { ApproveExpenseRequestDto } from '../models/approve-expense.request.dto';
import { ExpenseResponseDto } from '../models/expense.response.dto';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { PaginatedQueryDto } from '../../common/models/paginated-query.dto';

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
      businessId,
      amount: dto.amount,
      notes: dto.notes,
      category: dto.category,
      requester: currentMember,
      status: ExpenseStatus.PENDING,
    });

    await this.expenseRepository.persistAndFlush(expense);

    return this.mapToResponseDto(expense);
  }

  /**
   * Get expenses with pagination and filtering
   */
  async getExpenses(
    businessId: string,
    query: PaginatedQueryDto,
    currentMember: Member,
  ): Promise<{ expenses: ExpenseResponseDto[]; total: number }> {
    const { page = 1, limit = 10, search, status } = query;
    const offset = (page - 1) * limit;

    const filter: any = { businessId };
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { notes: { $ilike: `%${search}%` } },
      ];
    }

    const [expenses, total] = await this.expenseRepository.findAndCount(
      filter,
      {
        limit,
        offset,
        orderBy: { createdAt: 'DESC' },
        populate: [
          'requester.user',
          'approver.user',
        ],
      },
    );

    return {
      expenses: expenses.map(expense => this.mapToResponseDto(expense)),
      total,
    };
  }

  /**
   * Get a specific expense by ID
   */
  async getExpense(
    businessId: string,
    expenseId: number,
    currentMember: Member,
  ): Promise<ExpenseResponseDto> {
    const expense = await this.expenseRepository.findOne(
      {
        id: expenseId,
        businessId,
      },
      {
        populate: [
          'requester.user',
          'approver.user',
        ],
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
        id: expenseId,
        businessId,
      },
      {
        populate: [
          'requester.user',
          'approver.user',
        ],
      },
    );

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Validate rejection reason is provided when rejecting
    if (dto.status === ExpenseStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required when rejecting an expense');
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

    await this.expenseRepository.persistAndFlush(expense);

    return this.mapToResponseDto(expense);
  }

  /**
   * Cancel an expense (only by requester or with approval permission)
   */
  async cancelExpense(
    businessId: string,
    expenseId: number,
    currentMember: Member,
  ): Promise<ExpenseResponseDto> {
    const expense = await this.expenseRepository.findOne(
      {
        id: expenseId,
        businessId,
      },
      {
        populate: [
          'requester.user',
          'approver.user',
        ],
      },
    );

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    expense.status = ExpenseStatus.CANCELLED;

    await this.expenseRepository.persistAndFlush(expense);

    return this.mapToResponseDto(expense);
  }

  /**
   * Map expense entity to response DTO
   */
  private mapToResponseDto(expense: Expense): ExpenseResponseDto {
    return {
      id: expense.id,
      amount: expense.amount,
      currency: expense.currency,
      notes: expense.notes,
      category: expense.category,
      status: expense.status,
      approvedAt: expense.approvedAt?.toISOString(),
      rejectedAt: expense.rejectedAt?.toISOString(),
      rejectionReason: expense.rejectionReason,
      requester: {
        id: expense.requester.id,
        position: expense.requester.position,
        user: {
          id: expense.requester.user.id,
          firstName: expense.requester.user.firstName,
          lastName: expense.requester.user.lastName,
          phone: expense.requester.user.phone,
          avatar: expense.requester.user.avatar,
        },
      },
      approver: expense.approver ? {
        id: expense.approver.id,
        position: expense.approver.position,
        user: {
          id: expense.approver.user.id,
          firstName: expense.approver.user.firstName,
          lastName: expense.approver.user.lastName,
          phone: expense.approver.user.phone,
          avatar: expense.approver.user.avatar,
        },
      } : undefined,
      createdAt: expense.createdAt.toISOString(),
    };
  }
}
