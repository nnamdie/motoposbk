import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { AbstractNotificationProvider } from './abstract-notification-provider';
import { SendNotificationRequest, SendNotificationResult } from '../models/notification-provider.interface';

@Injectable()
export class LoggingProvider extends AbstractNotificationProvider {
  private readonly logger = new Logger(LoggingProvider.name);
  readonly providerName = 'logging';
  readonly channel = NotificationChannel.WHATSAPP; // Can handle both channels

  async sendNotification(
    request: SendNotificationRequest,
  ): Promise<SendNotificationResult> {
    this.logger.log(`[DEV MODE] Notification would be sent via ${request.channel || 'unknown'} channel`);
    this.logger.log(`Receiver: ${request.receiver}`);
    this.logger.log(`Business ID: ${request.businessId}`);
    this.logger.log(`Template: ${JSON.stringify(request.template, null, 2)}`);
    this.logger.log(`Variables: ${JSON.stringify(request.variables, null, 2)}`);
    this.logger.log('--- End of notification log ---');

    // Simulate successful sending
    return {
      success: true,
      externalId: `dev-${Date.now()}`,
    };
  }

  isAvailable(): boolean {
    return true; // Always available in dev mode
  }

  getConfigRequirements(): string[] {
    return []; // No external configuration needed
  }

  getSupportedFeatures(): string[] {
    return ['whatsapp', 'sms', 'logging'];
  }

  validateRequest(request: SendNotificationRequest): boolean {
    return super.validateRequest(request);
  }
}
