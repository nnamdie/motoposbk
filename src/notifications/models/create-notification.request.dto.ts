import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { User } from '@/auth/entities/user.entity';
import { Business } from '@/business/entities/business.entity';

import { NotificationChannel } from '../enums/notification-channel.enum';

export class CreateNotificationRequestDto {
  @IsNotEmpty()
  @IsString()
  receiver!: User;

  @IsNotEmpty()
  @IsString()
  business!: Business;

  @IsNotEmpty()
  @IsObject()
  template!: string;

  @IsNotEmpty()
  @IsObject()
  variables!: Record<string, any>;

  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @IsNotEmpty()
  @IsDateString()
  @IsOptional()
  sendAt: Date = new Date(Date.now() + 10000);
}
