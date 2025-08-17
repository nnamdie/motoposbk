import { NotificationChannel } from '../enums/notification-channel.enum';
import { SendNotificationRequest, SendNotificationResult } from '../models/notification-provider.interface';


export abstract class AbstractNotificationProvider {
  abstract readonly providerName: string;
  abstract readonly channel: NotificationChannel;

  /**
   * Send a notification via this provider
   */
  abstract sendNotification(
    request: SendNotificationRequest,
  ): Promise<SendNotificationResult>;

  /**
   * Check if provider is available/configured
   */
  abstract isAvailable(): boolean;

  /**
   * Get provider-specific configuration requirements
   */
  abstract getConfigRequirements(): string[];

  /**
   * Get supported features
   */
  abstract getSupportedFeatures(): string[];

  /**
   * Validate notification request before sending
   */
  validateRequest(request: SendNotificationRequest): boolean {
    if (!request.receiver || !request.template || !request.variables) {
      return false;
    }
    return true;
  }
}
