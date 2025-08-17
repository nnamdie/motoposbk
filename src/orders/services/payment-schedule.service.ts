import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger } from '@nestjs/common';

import { User } from '../../auth/entities/user.entity';
import { Invoice } from '../entities/invoice.entity';
import { PaymentSchedule } from '../entities/payment-schedule.entity';
import { InstallmentFrequency } from '../enums/installment-frequency.enum';
import { ScheduleStatus } from '../enums/schedule-status.enum';
import { InstallmentPlan } from '../models/installment-plan.interface';
import { PaymentDistributionResponseDto } from '../models/payment-distribution.response.dto';
import { PaymentDistributionResult } from '../models/payment-distribution-result.interface';
import { PaymentScheduleResponseDto } from '../models/payment-schedule.response.dto';

@Injectable()
export class PaymentScheduleService {
  private readonly logger = new Logger(PaymentScheduleService.name);

  constructor(
    @InjectRepository(PaymentSchedule)
    private readonly scheduleRepository: EntityRepository<PaymentSchedule>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: EntityRepository<Invoice>,
    private readonly em: EntityManager,
  ) {}

  /**
   * Generate payment schedule for installment payments
   */
  async generatePaymentSchedule(
    businessId: string,
    invoice: Invoice,
    plan: InstallmentPlan,
    createdBy: User,
    em?: EntityManager,
  ): Promise<PaymentSchedule[]> {
    const manager = em || this.em;

    this.logger.log(
      `Generating payment schedule for invoice ${invoice.invoiceNumber}`,
    );

    const {
      totalAmount,
      downPaymentAmount,
      frequency,
      startDate = new Date(),
    } = plan;
    const remainingAmount = totalAmount - downPaymentAmount;

    // Calculate number of installments if not provided
    let numberOfInstallments = plan.numberOfInstallments;

    if (!numberOfInstallments) {
      numberOfInstallments = this.calculateDefaultInstallments(
        remainingAmount,
        frequency,
      );
    }

    const installmentAmount = Math.round(
      remainingAmount / numberOfInstallments,
    );
    const lastInstallmentAmount =
      remainingAmount - installmentAmount * (numberOfInstallments - 1);

    const schedules: PaymentSchedule[] = [];

    // Create schedule for each installment
    for (let i = 1; i <= numberOfInstallments; i++) {
      const dueDate = this.calculateDueDate(startDate, i, frequency);
      const amount =
        i === numberOfInstallments ? lastInstallmentAmount : installmentAmount;

      const schedule = manager.create(PaymentSchedule, {
        business: { ggId: businessId },
        invoice,

        installmentNumber: i,
        dueDate,
        amountDue: amount,
        currency: invoice.currency,
        status: ScheduleStatus.PENDING,
        createdBy,
      });

      schedules.push(schedule);
    }

    await manager.persistAndFlush(schedules);

    this.logger.log(
      `Created ${schedules.length} payment schedules for invoice ${invoice.invoiceNumber}`,
    );
    return schedules;
  }

  /**
   * Check if a schedule is overdue
   */
  isScheduleOverdue(schedule: PaymentSchedule): boolean {
    if (schedule.isFullyPaid) return false;
    return new Date() > schedule.dueDate;
  }

  /**
   * Apply payment to a specific schedule
   * Returns the excess amount if payment exceeds what's due
   */
  applyPaymentToSchedule(schedule: PaymentSchedule, amount: number): number {
    const applicableAmount = Math.min(amount, schedule.remainingBalance);

    schedule.amountPaid += applicableAmount;
    schedule.lastPaymentAt = new Date();

    // Update status based on new payment
    this.updateScheduleStatus(schedule);

    // Return excess amount
    return amount - applicableAmount;
  }

  /**
   * Update schedule status based on current state and due date
   */
  updateScheduleStatus(schedule: PaymentSchedule): void {
    if (schedule.isFullyPaid) {
      schedule.status = ScheduleStatus.PAID;
      schedule.paidAt = new Date();
    } else if (schedule.isPartiallyPaid) {
      schedule.status = ScheduleStatus.PARTIAL_PAID;
    } else if (this.isScheduleOverdue(schedule)) {
      schedule.status = ScheduleStatus.OVERDUE;
    } else {
      schedule.status = ScheduleStatus.PENDING;
    }
  }

  /**
   * Distribute payment amount across payment schedules with overpayment handling
   */
  async distributePayment(
    businessId: string,
    invoiceId: number,
    paymentAmount: number,
    targetInstallmentNumber?: number,
  ): Promise<PaymentDistributionResult> {
    return await this.em.transactional(async (em) => {
      // Get all pending/partial schedules for the invoice
      const schedules = await em.find(
        PaymentSchedule,
        {
          business: { ggId: businessId },
          invoice: { id: invoiceId },
          status: {
            $in: [
              ScheduleStatus.PENDING,
              ScheduleStatus.PARTIAL_PAID,
              ScheduleStatus.OVERDUE,
            ],
          },
        },
        {
          orderBy: { installmentNumber: 'ASC' },
        },
      );

      if (schedules.length === 0) {
        return {
          appliedAmount: 0,
          excessAmount: paymentAmount,
          updatedSchedules: [],
          invoiceFullyPaid: true,
        };
      }

      let remainingAmount = paymentAmount;
      const updatedSchedules: PaymentSchedule[] = [];

      // If target installment is specified, start from there, otherwise start from first unpaid
      let startIndex = 0;

      if (targetInstallmentNumber) {
        startIndex = schedules.findIndex(
          (s) => s.installmentNumber === targetInstallmentNumber,
        );
        if (startIndex === -1) startIndex = 0;
      }

      // Distribute payment across schedules starting from the target/first unpaid
      for (
        let i = startIndex;
        i < schedules.length && remainingAmount > 0;
        i++
      ) {
        const schedule = schedules[i];
        const appliedToThisSchedule = Math.min(
          remainingAmount,
          schedule.remainingBalance,
        );
        const excessFromThisSchedule = this.applyPaymentToSchedule(
          schedule,
          remainingAmount,
        );

        remainingAmount = excessFromThisSchedule;
        updatedSchedules.push(schedule);

        this.logger.log(
          `Applied ₦${appliedToThisSchedule.toLocaleString()} to installment ${schedule.installmentNumber}. ` +
            `Status: ${schedule.status}, Remaining payment: ₦${remainingAmount.toLocaleString()}`,
        );
      }

      // Update all modified schedules
      await em.persistAndFlush(updatedSchedules);

      // Check if invoice is fully paid
      const allSchedules = await em.find(PaymentSchedule, {
        business: { ggId: businessId },
        invoice: { id: invoiceId },
      });

      const invoiceFullyPaid = allSchedules.every((s) => s.isFullyPaid);

      // Update invoice status if fully paid
      if (invoiceFullyPaid) {
        const invoice = await em.findOneOrFail(Invoice, {
          id: invoiceId,
          business: { ggId: businessId },
        });

        invoice.paidAmount = invoice.total;
        invoice.balanceAmount = 0;
        invoice.paidAt = new Date();

        await em.persistAndFlush(invoice);
      }

      return {
        appliedAmount: paymentAmount - remainingAmount,
        excessAmount: remainingAmount,
        updatedSchedules,
        invoiceFullyPaid,
      };
    });
  }

  /**
   * Get payment schedule for an invoice
   */
  async getPaymentSchedule(
    businessId: string,
    invoiceId: number,
  ): Promise<PaymentSchedule[]> {
    return await this.scheduleRepository.find(
      { business: { ggId: businessId }, invoice: { id: invoiceId } },
      { orderBy: { installmentNumber: 'ASC' } },
    );
  }

  /**
   * Update overdue statuses for all schedules
   */
  async updateOverdueStatuses(businessId: string): Promise<void> {
    const potentiallyOverdueSchedules = await this.scheduleRepository.find({
      business: { ggId: businessId },
      dueDate: { $lt: new Date() },
      status: { $in: [ScheduleStatus.PENDING, ScheduleStatus.PARTIAL_PAID] },
    });

    const updatedSchedules: PaymentSchedule[] = [];

    for (const schedule of potentiallyOverdueSchedules) {
      const oldStatus = schedule.status;

      this.updateScheduleStatus(schedule);

      if (oldStatus !== schedule.status) {
        updatedSchedules.push(schedule);
      }
    }

    if (updatedSchedules.length > 0) {
      await this.em.persistAndFlush(updatedSchedules);
      this.logger.log(
        `Updated ${updatedSchedules.length} overdue payment schedules`,
      );
    }
  }

  /**
   * Handle underpayment by adding the shortfall to the next installment
   */
  async handleUnderpayment(
    businessId: string,
    invoiceId: number,
    installmentNumber: number,
    shortfallAmount: number,
  ): Promise<PaymentSchedule | null> {
    const nextSchedule = await this.scheduleRepository.findOne(
      {
        business: { ggId: businessId },
        invoice: { id: invoiceId },
        installmentNumber: { $gt: installmentNumber },
        status: { $in: [ScheduleStatus.PENDING, ScheduleStatus.PARTIAL_PAID] },
      },
      {
        orderBy: { installmentNumber: 'ASC' },
      },
    );

    if (nextSchedule) {
      nextSchedule.amountDue += shortfallAmount;
      nextSchedule.notes =
        (nextSchedule.notes || '') +
        `\nAdded ₦${shortfallAmount.toLocaleString()} shortfall from installment ${installmentNumber}`;

      await this.em.persistAndFlush(nextSchedule);

      this.logger.log(
        `Added ₦${shortfallAmount.toLocaleString()} shortfall to installment ${nextSchedule.installmentNumber}`,
      );
    }

    return nextSchedule;
  }

  /**
   * Calculate default number of installments based on amount and frequency
   */
  private calculateDefaultInstallments(
    amount: number,
    frequency: InstallmentFrequency,
  ): number {
    // Default installment calculation logic
    switch (frequency) {
      case InstallmentFrequency.DAILY:
        return Math.min(Math.ceil(amount / 50000), 30); // Max 30 days
      case InstallmentFrequency.WEEKLY:
        return Math.min(Math.ceil(amount / 200000), 12); // Max 12 weeks
      case InstallmentFrequency.MONTHLY:
        return Math.min(Math.ceil(amount / 500000), 6); // Max 6 months
      default:
        return 4; // Default 4 installments
    }
  }

  /**
   * Calculate due date for an installment based on frequency
   */
  private calculateDueDate(
    startDate: Date,
    installmentNumber: number,
    frequency: InstallmentFrequency,
  ): Date {
    const dueDate = new Date(startDate);

    switch (frequency) {
      case InstallmentFrequency.DAILY:
        dueDate.setDate(dueDate.getDate() + installmentNumber);
        break;
      case InstallmentFrequency.WEEKLY:
        dueDate.setDate(dueDate.getDate() + installmentNumber * 7);
        break;
      case InstallmentFrequency.MONTHLY:
        dueDate.setMonth(dueDate.getMonth() + installmentNumber);
        break;
    }

    return dueDate;
  }

  /**
   * Map PaymentSchedule entity to response DTO
   */
  mapToPaymentScheduleResponse(
    schedule: PaymentSchedule,
  ): PaymentScheduleResponseDto {
    return {
      id: schedule.id,
      invoiceId: schedule.invoice.id,
      installmentNumber: schedule.installmentNumber,
      dueDate: schedule.dueDate.toISOString().split('T')[0], // YYYY-MM-DD format
      amountDue: schedule.amountDue,
      amountPaid: schedule.amountPaid,
      remainingBalance: schedule.remainingBalance,
      currency: schedule.currency,
      status: schedule.status,
      notes: schedule.notes,
      paidAt: schedule.paidAt?.toISOString(),
      lastPaymentAt: schedule.lastPaymentAt?.toISOString(),
      isFullyPaid: schedule.isFullyPaid,
      isPartiallyPaid: schedule.isPartiallyPaid,
      isOverdue: this.isScheduleOverdue(schedule),
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
    };
  }

  /**
   * Map PaymentDistributionResult to response DTO
   */
  mapToPaymentDistributionResponse(
    result: PaymentDistributionResult,
    originalAmount: number,
  ): PaymentDistributionResponseDto {
    const summary = this.generateDistributionSummary(result, originalAmount);

    return {
      appliedAmount: result.appliedAmount,
      excessAmount: result.excessAmount,
      updatedSchedules: result.updatedSchedules.map((schedule) =>
        this.mapToPaymentScheduleResponse(schedule),
      ),
      invoiceFullyPaid: result.invoiceFullyPaid,
      summary,
    };
  }

  /**
   * Generate a human-readable summary of payment distribution
   */
  private generateDistributionSummary(
    result: PaymentDistributionResult,
    originalAmount: number,
  ): string {
    const { excessAmount, updatedSchedules, invoiceFullyPaid } = result;

    let summary = `Payment of ₦${(originalAmount / 100).toLocaleString()} distributed`;

    if (updatedSchedules.length > 0) {
      summary += ` across ${updatedSchedules.length} installment${updatedSchedules.length > 1 ? 's' : ''}`;
    }

    if (excessAmount > 0) {
      summary += `. Overpayment of ₦${(excessAmount / 100).toLocaleString()} recorded`;
    }

    if (invoiceFullyPaid) {
      summary += '. Invoice is now fully paid';
    }

    summary += '.';

    return summary;
  }
}
