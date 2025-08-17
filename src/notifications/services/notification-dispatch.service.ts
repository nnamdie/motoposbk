import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateRequestContext, EntityManager } from '@mikro-orm/postgresql';
import * as Mustache from 'mustache';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Notification } from '../entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationProviderFactory } from '../factories/notification-provider.factory';
import { AbstractNotificationProvider } from '../providers/abstract-notification-provider';
import { NotificationStatus } from '../enums/notification-status.enum';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { TemplateConfigService } from './template-config.service';
import { SendNotificationResult } from '../models/notification-provider.interface';

@Injectable()
export class NotificationDispatchService {
  private readonly logger = new Logger(NotificationDispatchService.name);
  private readonly maxRetryCount = 3; // Maximum retry attempts
  private readonly retryDelayMinutes = 5; // Delay between retries

  constructor(
    private readonly em: EntityManager,
    private readonly notificationService: NotificationService,
    private readonly providerFactory: NotificationProviderFactory,
    private readonly templateConfigService: TemplateConfigService,
  ) {}


  @Cron(CronExpression.EVERY_10_SECONDS)
  @CreateRequestContext()
  async processPendingNotifications(): Promise<void> {
    this.logger.log('Starting notification dispatch process...');

    try {
      // Fetch ALL pending notifications across ALL businesses
      const pendingNotifications = await this.em.find(Notification, {
        status: NotificationStatus.PENDING,
        sendAt: { $lte: new Date() },
      });

      if (pendingNotifications.length === 0) {
        this.logger.log('No pending notifications to process');
        return;
      }

      this.logger.log(`Processing ${pendingNotifications.length} pending notifications`);

      // Process each notification
      for (const notification of pendingNotifications) {
        await this.processNotification(notification);
      }

      this.logger.log('Pending notifications dispatch process completed');
    } catch (error) {
      this.logger.error(`Error in pending notifications dispatch process: ${error.message}`);
    }
  }


  @Cron(CronExpression.EVERY_30_SECONDS)
  @CreateRequestContext()
  async processFailedNotifications(): Promise<void> {
    this.logger.log('Starting failed notifications retry process...');

    try {
      // Fetch ALL failed notifications across ALL businesses
      const failedNotifications = await this.em.find(Notification, {
        status: NotificationStatus.FAILED,
        retryCount: { $lt: this.maxRetryCount },
      });

      if (failedNotifications.length === 0) {
        this.logger.log('No failed notifications to retry');
        return;
      }

      this.logger.log(`Processing ${failedNotifications.length} failed notifications for retry`);

      // Process each failed notification for retry
      for (const notification of failedNotifications) {
        await this.processFailedNotificationForRetry(notification);
      }

      this.logger.log('Failed notifications retry process completed');
    } catch (error) {
      this.logger.error(`Error in failed notifications retry process: ${error.message}`);
    }
  }


  private async processNotification(notification: Notification): Promise<void> {
    try {
      this.logger.log(`Processing notification ${notification.id} for template '${notification.template}' (Business: ${notification.business.ggId})`);

      // Step 1: Get template configuration from cache
      const templateConfig = await this.templateConfigService.getTemplateConfig(notification.template);
      if (!templateConfig) {
        await this.notificationService.markNotificationFailed(
          notification.id,
          notification.business.ggId,
          `Template '${notification.template}' not found in configuration`,
        );
        return;
      }

      // Step 2: Check if template supports the notification's channel
      if (!templateConfig.channels.hasOwnProperty(notification.channel)) {
        await this.notificationService.markNotificationFailed(
          notification.id,
          notification.business.ggId,
          `Template '${notification.template}' does not support channel '${notification.channel}'`,
        );
        return;
      }

      // Step 3: Get the appropriate provider
      const provider = this.providerFactory.createProvider(notification.channel);
      
      if (!provider.isAvailable()) {
        await this.notificationService.markNotificationFailed(
          notification.id,
          notification.business.ggId,
          `Provider ${provider.providerName} is not available`,
        );
        return;
      }

      // Step 4: Process the notification
      const result = await this.sendNotification(notification, templateConfig, provider);
      
      if (result.success) {
        await this.notificationService.updateNotificationStatus(
          notification.id,
          notification.business.ggId,
          NotificationStatus.SENT,
          { sentAt: new Date(), externalId: result.externalId },
        );
        this.logger.log(`Notification ${notification.id} sent successfully`);
      } else {
        await this.notificationService.markNotificationFailed(
          notification.id,
          notification.business.ggId,
          result.errorMessage || 'Unknown error',
        );
      }
    } catch (error) {
      this.logger.error(`Error processing notification ${notification.id}: ${error.message}`);
      await this.notificationService.markNotificationFailed(
        notification.id,
        notification.business.ggId,
        error.message,
      );
    }
  }

  /**
   * Process a failed notification for retry
   */
  private async processFailedNotificationForRetry(notification: Notification): Promise<void> {
    try {
      // Check if notification is within retry threshold
      if (notification.retryCount >= this.maxRetryCount) {
        this.logger.warn(`Notification ${notification.id} has exceeded max retry count (${this.maxRetryCount}), skipping retry`);
        return;
      }

      // Check if enough time has passed since last retry
      const now = new Date();
      const lastRetryTime = notification.lastRetryAt || notification.createdAt;
      const timeSinceLastRetry = now.getTime() - lastRetryTime.getTime();
      const retryDelayMs = this.retryDelayMinutes * 60 * 1000;

      if (timeSinceLastRetry < retryDelayMs) {
        // Not enough time has passed, skip this retry
        return;
      }

      this.logger.log(`Retrying failed notification ${notification.id} (Attempt ${notification.retryCount + 1}/${this.maxRetryCount})`);

      // Reset status to pending for retry
      await this.notificationService.updateNotificationStatus(
        notification.id,
        notification.business.ggId,
        NotificationStatus.PENDING,
        { 
          lastRetryAt: now,
          errorMessage: undefined, // Clear previous error
        },
      );

      // Process the notification again
      await this.processNotification(notification);

    } catch (error) {
      this.logger.error(`Error processing failed notification ${notification.id} for retry: ${error.message}`);
    }
  }

  /**
   * Send notification via provider
   */
  private async sendNotification(
    notification: Notification,
    templateConfig: any,
    provider: AbstractNotificationProvider,
  ): Promise<SendNotificationResult> {
    try {
      // Process template variables using Mustache
      const processedVariables = await this.processTemplateVariables(
        templateConfig,
        notification.variables,
        notification.channel,
      );

      const request = {
        receiver: notification.receiver as any, // User ID
        template: notification.template,
        variables: processedVariables,
        businessId: notification.business.ggId,
        channel: notification.channel,
      };

      return await provider.sendNotification(request);
    } catch (error) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Process template variables using Mustache
   */
  private async processTemplateVariables(
    templateConfig: any,
    variables: Record<string, any>,
    channel: NotificationChannel,
  ): Promise<Record<string, any>> {
    try {
      const channelConfig = templateConfig.channels?.[channel];
      if (!channelConfig) {
        throw new Error(`No configuration found for channel ${channel}`);
      }

      // Load template file if specified
      let templateContent = '';
      if (channelConfig.textTemplateSource) {
        try {
          templateContent = await fs.readFile(
            path.resolve(channelConfig.textTemplateSource),
            'utf-8'
          );
        } catch (error) {
          this.logger.warn(`Could not load template file: ${channelConfig.textTemplateSource}`);
        }
      }

      // Process variables using Mustache
      const processedVariables: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(channelConfig.twilioContentVariables || {})) {
        if (typeof value === 'string' && value.includes('{{')) {
          // Use Mustache to process the template
          processedVariables[key] = Mustache.render(value, variables);
        } else {
          processedVariables[key] = value;
        }
      }

      // If we have a template file, process it too
      if (templateContent) {
        processedVariables.templateContent = Mustache.render(templateContent, variables);
      }

      return processedVariables;
    } catch (error) {
      this.logger.error(`Error processing template variables: ${error.message}`);
      return variables; // Return original variables as fallback
    }
  }

  /**
   * Manually trigger notification processing (for testing/debugging)
   */
  async triggerProcessing(): Promise<void> {
    this.logger.log('Manually triggering notification processing...');
    await this.processPendingNotifications();
    await this.processFailedNotifications();
  }

  /**
   * Get dispatch service status
   */
  async getDispatchStatus(): Promise<{
    totalPending: number;
    totalFailed: number;
    totalRetryable: number;
    providers: Record<string, { available: boolean; configRequirements: string[] }>;
    templateCache: { templateCount: number; initialized: boolean; templateNames: string[] };
    lastProcessed: Date;
    retryConfig: { maxRetryCount: number; retryDelayMinutes: number };
  }> {
    const totalPending = await this.em.count(Notification, {
      status: NotificationStatus.PENDING,
      sendAt: { $lte: new Date() },
    });

    const totalFailed = await this.em.count(Notification, {
      status: NotificationStatus.FAILED,
    });

    const totalRetryable = await this.em.count(Notification, {
      status: NotificationStatus.FAILED,
      retryCount: { $lt: this.maxRetryCount },
    });

    return {
      totalPending,
      totalFailed,
      totalRetryable,
      providers: this.providerFactory.getProviderStatus(),
      templateCache: this.templateConfigService.getCacheStatus(),
      lastProcessed: new Date(),
      retryConfig: {
        maxRetryCount: this.maxRetryCount,
        retryDelayMinutes: this.retryDelayMinutes,
      },
    };
  }

  /**
   * Refresh template cache manually
   */
  async refreshTemplateCache(): Promise<void> {
    await this.templateConfigService.forceRefreshCache();
  }

  /**
   * Get retry statistics for a specific business
   */
  async getRetryStats(businessId?: string): Promise<{
    totalFailed: number;
    retryableCount: number;
    maxRetryExceeded: number;
    averageRetryCount: number;
  }> {
    const whereClause = businessId ? { businessId } : {};
    
    const failedNotifications = await this.em.find(Notification, {
      ...whereClause,
      status: NotificationStatus.FAILED,
    });

    const totalFailed = failedNotifications.length;
    const retryableCount = failedNotifications.filter(n => n.retryCount < this.maxRetryCount).length;
    const maxRetryExceeded = failedNotifications.filter(n => n.retryCount >= this.maxRetryCount).length;
    
    const totalRetryCount = failedNotifications.reduce((sum, n) => sum + (n.retryCount || 0), 0);
    const averageRetryCount = totalFailed > 0 ? totalRetryCount / totalFailed : 0;

    return {
      totalFailed,
      retryableCount,
      maxRetryExceeded,
      averageRetryCount: Math.round(averageRetryCount * 100) / 100,
    };
  }
}
