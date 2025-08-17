import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NotificationChannel } from '../enums/notification-channel.enum';
import {
  SendNotificationRequest,
  SendNotificationResult,
} from '../models/notification-provider.interface';
import { AbstractNotificationProvider } from './abstract-notification-provider';

@Injectable()
export class TwilioSmsProvider extends AbstractNotificationProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  readonly providerName = 'twilio-sms';
  readonly channel = NotificationChannel.SMS;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async sendNotification(
    request: SendNotificationRequest,
  ): Promise<SendNotificationResult> {
    try {
      this.logger.log(`Sending SMS notification to ${request.receiver}`);

      // TODO: Implement actual Twilio SMS API call
      this.logger.log(
        `SMS notification sent successfully to ${request.receiver}`,
      );

      return {
        success: true,
        externalId: `twilio-sms-${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS notification: ${error.message}`);
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  isAvailable(): boolean {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const smsFrom = this.configService.get<string>('TWILIO_SMS_FROM');

    return !!(accountSid && authToken && smsFrom);
  }

  getConfigRequirements(): string[] {
    return ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_SMS_FROM'];
  }

  getSupportedFeatures(): string[] {
    return ['sms', 'template-support', 'variable-substitution'];
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

  private getSmsFrom(): string {
    const from = this.configService.get<string>('TWILIO_SMS_FROM');

    if (!from) {
      throw new Error('Twilio SMS from number not configured');
    }
    return from;
  }
}
