export interface SendNotificationRequest {
  receiver: number; // User ID
  template: string; // Template name
  variables: Record<string, any>;
  businessId: string;
  channel: string;
}

export interface SendNotificationResult {
  success: boolean;
  externalId?: string;
  errorMessage?: string;
}