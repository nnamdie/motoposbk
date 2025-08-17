import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { Business } from '../business/entities/business.entity';
import { User } from '../auth/entities/user.entity';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './services/notification.service';
import { NotificationDispatchService } from './services/notification-dispatch.service';
import { TemplateConfigService } from './services/template-config.service';
import { TwilioWhatsAppProvider } from './providers/twilio-whatsapp-provider';
import { TwilioSmsProvider } from './providers/twilio-sms-provider';
import { LoggingProvider } from './providers/logging-provider';
import { NotificationProviderFactory } from './factories/notification-provider.factory';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Notification,
      Business,
      User,
    ]),
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
  exports: [NotificationService, NotificationDispatchService, TemplateConfigService],
})
export class NotificationsModule {}
