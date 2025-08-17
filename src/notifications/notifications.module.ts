import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { User } from '../auth/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { Notification } from './entities/notification.entity';
import { NotificationProviderFactory } from './factories/notification-provider.factory';
import { LoggingProvider } from './providers/logging-provider';
import { TwilioSmsProvider } from './providers/twilio-sms-provider';
import { TwilioWhatsAppProvider } from './providers/twilio-whatsapp-provider';
import { NotificationService } from './services/notification.service';
import { NotificationDispatchService } from './services/notification-dispatch.service';
import { TemplateConfigService } from './services/template-config.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Notification, Business, User]),
    ScheduleModule.forRoot(),
  ],
  providers: [
    NotificationService,
    NotificationDispatchService,
    TemplateConfigService,
    TwilioWhatsAppProvider,
    TwilioSmsProvider,
    LoggingProvider,
    NotificationProviderFactory,
  ],
  exports: [
    NotificationService,
    NotificationDispatchService,
    TemplateConfigService,
  ],
})
export class NotificationsModule {}
