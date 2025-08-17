import { EntityManager } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { Notification } from '../entities/notification.entity';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { NotificationStatus } from '../enums/notification-status.enum';
import { CreateNotificationRequestDto } from '../models/create-notification.request.dto';
import { TemplateConfigService } from './template-config.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly templateConfigService: TemplateConfigService,
  ) {}

  /**
   * Queue a notification (new flow)
   * This validates the template and creates a notification record
   */
  async queueNotification(
    createDto: CreateNotificationRequestDto,
  ): Promise<Notification> {
    this.logger.log(
      `Queueing notification for business ${createDto.business.name}[${createDto.business.id}] via ${createDto.channel}`,
    );

    // Step 1: Validate template exists
    const templateConfig = await this.templateConfigService.getTemplateConfig(
      createDto.template,
    );

    if (!templateConfig) {
      throw new BadRequestException(
        `Template '${createDto.template}' not found`,
      );
    }

    // Step 2: Check if template supports the requested channel
    const channelSupported =
      await this.templateConfigService.validateTemplateChannel(
        createDto.template,
        createDto.channel,
      );

    if (!channelSupported) {
      throw new BadRequestException(
        `Template '${createDto.template}' does not support channel '${createDto.channel}'`,
      );
    }

    // Step 3: Validate required variables
    const variableValidation =
      await this.templateConfigService.validateTemplateVariables(
        createDto.template,
        createDto.variables,
      );

    if (!variableValidation.isValid) {
      throw new BadRequestException(
        `Missing required variables: ${variableValidation.missing.join(', ')}`,
      );
    }

    // Step 4: Create notification record
    const notification = this.em.create(Notification, {
      template: createDto.template, // Store template name, not full config
      receiver: createDto.receiver,
      business: createDto.business,
      variables: createDto.variables,
      channel: createDto.channel,
      sendAt: createDto.sendAt,
      status: NotificationStatus.PENDING,
    });

    await this.em.persistAndFlush(notification);

    this.logger.log(`Notification queued with ID: ${notification.id}`);
    return notification;
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(
    id: number,
    businessId: string,
  ): Promise<Notification> {
    const notification = await this.em.findOne(Notification, {
      id,
      business: { ggId: businessId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  /**
   * Get pending notifications for a business
   */
  async getPendingNotifications(businessId: string): Promise<Notification[]> {
    return this.em.find(Notification, {
      business: { ggId: businessId },
      status: NotificationStatus.PENDING,
      sendAt: { $lte: new Date() } as any,
    });
  }

  /**
   * Get notifications by status for a business
   */
  async getNotificationsByStatus(
    businessId: string,
    status: NotificationStatus,
    limit = 100,
  ): Promise<Notification[]> {
    return this.em.find(
      Notification,
      {
        business: { ggId: businessId },
        status,
      },
      {
        limit,
        orderBy: { createdAt: 'DESC' },
      },
    );
  }

  /**
   * Update notification status
   */
  async updateNotificationStatus(
    id: number,
    businessId: string,
    status: NotificationStatus,
    metadata?: Partial<Notification>,
  ): Promise<Notification> {
    const notification = await this.getNotificationById(id, businessId);

    notification.status = status;

    if (metadata) {
      Object.assign(notification, metadata);
    }

    // Set timestamps based on status
    switch (status) {
      case NotificationStatus.SENT:
        notification.sentAt = new Date();
        break;
      case NotificationStatus.DELIVERED:
        notification.deliveredAt = new Date();
        break;
      case NotificationStatus.READ:
        notification.readAt = new Date();
        break;
      case NotificationStatus.FAILED:
        notification.lastRetryAt = new Date();
        notification.retryCount = (notification.retryCount || 0) + 1;
        break;
    }

    await this.em.persistAndFlush(notification);
    return notification;
  }

  /**
   * Mark notification as failed with error message
   */
  async markNotificationFailed(
    id: number,
    businessId: string,
    errorMessage: string,
  ): Promise<Notification> {
    return this.updateNotificationStatus(
      id,
      businessId,
      NotificationStatus.FAILED,
      { errorMessage },
    );
  }

  /**
   * Get available templates for a channel
   */
  async getAvailableTemplates(
    channel?: NotificationChannel,
  ): Promise<string[]> {
    if (channel) {
      return this.templateConfigService.getTemplatesByChannel(channel);
    }
    return this.templateConfigService.getAvailableTemplates();
  }

  /**
   * Get template configuration
   */
  async getTemplateConfig(templateName: string) {
    return this.templateConfigService.getTemplateConfig(templateName);
  }
}
