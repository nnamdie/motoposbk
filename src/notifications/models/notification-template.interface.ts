export interface NotificationTemplate {
  variables: Record<string, any>;
  channels: {
    whatsapp?: ChannelConfig;
    sms?: ChannelConfig;
  };
}

export interface ChannelConfig {
  textTemplateSource: string;
  twilioContentSid: string;
  twilioContentVariables: Record<string, string>;
}
