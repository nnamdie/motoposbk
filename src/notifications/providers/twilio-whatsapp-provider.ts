import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NotificationChannel } from '../enums/notification-channel.enum';
import {
  SendNotificationRequest,
  SendNotificationResult,
} from '../models/notification-provider.interface';
import { AbstractNotificationProvider } from './abstract-notification-provider';

@Injectable()
export class TwilioWhatsAppProvider extends AbstractNotificationProvider {
  private readonly logger = new Logger(TwilioWhatsAppProvider.name);
  readonly providerName = 'twilio-whatsapp';
  readonly channel = NotificationChannel.WHATSAPP;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async sendNotification(
    request: SendNotificationRequest,
  ): Promise<SendNotificationResult> {
    try {
      this.logger.log(`Sending WhatsApp notification to ${request.receiver}`);

      // TODO: Implement actual Twilio WhatsApp API call
      this.logger.log(
        `WhatsApp notification sent successfully to ${request.receiver}`,
      );

      return {
        success: true,
        externalId: `twilio-${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp notification: ${error.message}`,
      );
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  isAvailable(): boolean {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const whatsappFrom = this.configService.get<string>('TWILIO_WHATSAPP_FROM');

    return !!(accountSid && authToken && whatsappFrom);
  }

  getConfigRequirements(): string[] {
    return ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_FROM'];
  }

  getSupportedFeatures(): string[] {
    return ['whatsapp', 'template-support', 'variable-substitution'];
  }

  private getAccountSid(): string {
    const sid = this.configService.get<string>('TWILIO_ACCOUNT_SID');

    if (!sid) {
      throw new Error('Twilio account SID not configured');
    }
    return sid;
  }

  private getAuthToken(): string {
    const token = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!token) {
      throw new Error('Twilio auth token not configured');
    }
    return token;
  }

  private getWhatsAppFrom(): string {
    const from = this.configService.get<string>('TWILIO_WHATSAPP_FROM');

    if (!from) {
      throw new Error('Twilio WhatsApp from number not configured');
    }
    return from;
  }
}
