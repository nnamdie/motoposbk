import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { AbstractNotificationProvider } from '../providers/abstract-notification-provider';
import { TwilioWhatsAppProvider } from '../providers/twilio-whatsapp-provider';
import { TwilioSmsProvider } from '../providers/twilio-sms-provider';
import { LoggingProvider } from '../providers/logging-provider';

@Injectable()
export class NotificationProviderFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly twilioWhatsAppProvider: TwilioWhatsAppProvider,
    private readonly twilioSmsProvider: TwilioSmsProvider,
    private readonly loggingProvider: LoggingProvider,
  ) {}

  createProvider(channel: NotificationChannel): AbstractNotificationProvider {
    const isDevMode = this.configService.get<string>('NODE_ENV') === 'development';

    // In development mode, use logging provider for all channels
    if (isDevMode) {
      return this.loggingProvider;
    }

    // In production, use appropriate provider based on channel
    switch (channel) {
      case NotificationChannel.WHATSAPP:
        return this.twilioWhatsAppProvider.isAvailable()
          ? this.twilioWhatsAppProvider
          : this.loggingProvider;

      case NotificationChannel.SMS:
        return this.twilioSmsProvider.isAvailable()
          ? this.twilioSmsProvider
          : this.loggingProvider;

      default:
        return this.loggingProvider;
    }
  }

  getAvailableProviders(): AbstractNotificationProvider[] {
    const providers: AbstractNotificationProvider[] = [];

    if (this.twilioWhatsAppProvider.isAvailable()) {
      providers.push(this.twilioWhatsAppProvider);
    }

    if (this.twilioSmsProvider.isAvailable()) {
      providers.push(this.twilioSmsProvider);
    }

    // Always include logging provider as fallback
    providers.push(this.loggingProvider);

    return providers;
  }

  getProviderStatus(): Record<string, { available: boolean; configRequirements: string[] }> {
    return {
      'twilio-whatsapp': {
        available: this.twilioWhatsAppProvider.isAvailable(),
        configRequirements: this.twilioWhatsAppProvider.getConfigRequirements(),
      },
      'twilio-sms': {
        available: this.twilioSmsProvider.isAvailable(),
        configRequirements: this.twilioSmsProvider.getConfigRequirements(),
      },
      'logging': {
        available: true,
        configRequirements: [],
      },
    };
  }
}

// Factory provider token
export const notificationProviderFactory = {
  provide: NotificationProviderFactory,
  useFactory: (
    configService: ConfigService,
    twilioWhatsAppProvider: TwilioWhatsAppProvider,
    twilioSmsProvider: TwilioSmsProvider,
    loggingProvider: LoggingProvider,
  ) => new NotificationProviderFactory(
    configService,
    twilioWhatsAppProvider,
    twilioSmsProvider,
    loggingProvider,
  ),
  inject: [ConfigService, TwilioWhatsAppProvider, TwilioSmsProvider, LoggingProvider],
};
