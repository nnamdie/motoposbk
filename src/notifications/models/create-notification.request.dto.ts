import { IsEnum, IsOptional, IsNotEmpty, IsObject, IsString, IsDateString } from 'class-validator';
import { NotificationChannel } from '../enums/notification-channel.enum';
import { User } from '@/auth/entities/user.entity';
import { Business } from '@/business/entities/business.entity';

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
