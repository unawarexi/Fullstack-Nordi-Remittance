// ============================================================================
// NOTIFICATION TYPES — Mirrors NotificationModel.ts
// Notification, EmailMessage, SMSMessage, PushNotification,
// NotificationPreference
// ============================================================================

declare global {
  interface AppNotification extends Timestamps {
    id: UUID;
    notificationId?: UUID;
    userId: UUID;
    user?: UUID;
    type: NotificationType;
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    isRead: boolean;
    readAt?: ISO8601Date;
    actionUrl?: string;
    actionLabel?: string;
    relatedResource?: {
      resourceType: string;
      resourceId: string;
    };
    metadata?: Record<string, unknown>;
    expiresAt?: ISO8601Date;
  }

  interface EmailMessage extends Timestamps {
    emailId: UUID;
    user: UUID;
    to: string;
    from: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    templateId?: string;
    templateData?: Record<string, unknown>;
    status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed' | 'opened' | 'clicked';
    provider: 'sendgrid' | 'ses' | 'mailgun' | 'smtp';
    providerMessageId?: string;
    attempts: number;
    lastAttemptAt?: ISO8601Date;
    sentAt?: ISO8601Date;
    deliveredAt?: ISO8601Date;
    openedAt?: ISO8601Date;
    clickedAt?: ISO8601Date;
    bouncedAt?: ISO8601Date;
    bounceReason?: string;
    failureReason?: string;
    requestBody?: Record<string, unknown>;
    responseBody?: Record<string, unknown>;
    attachments?: Array<{
      filename: string;
      contentType: string;
      url: string;
    }>;
    metadata?: Record<string, unknown>;
  }

  interface SMSMessage extends Timestamps {
    smsId: UUID;
    user: UUID;
    to: string;
    from: string;
    message: string;
    messageType: 'otp' | 'alert' | 'marketing' | 'transactional';
    status: 'queued' | 'sent' | 'delivered' | 'failed' | 'expired';
    provider: 'twilio' | 'nexmo' | 'sns' | 'messagebird';
    providerMessageId?: string;
    segments: number;
    cost?: number;
    currency?: string;
    attempts: number;
    lastAttemptAt?: ISO8601Date;
    sentAt?: ISO8601Date;
    deliveredAt?: ISO8601Date;
    failureReason?: string;
    metadata?: Record<string, unknown>;
  }

  interface PushNotificationEntry extends Timestamps {
    pushId: UUID;
    user: UUID;
    deviceTokens: string[];
    title: string;
    body: string;
    imageUrl?: string;
    icon?: string;
    badge?: number;
    sound?: string;
    priority: 'low' | 'normal' | 'high';
    clickAction?: string;
    data?: Record<string, unknown>;
    status: 'queued' | 'sent' | 'delivered' | 'failed';
    provider: 'fcm' | 'apns' | 'onesignal';
    successCount: number;
    failureCount: number;
    results?: Array<{
      deviceToken: string;
      status: 'success' | 'failed';
      error?: string;
    }>;
    sentAt?: ISO8601Date;
  }

  interface NotificationPreferences {
    email: {
      enabled?: boolean;
      transactions: boolean;
      security: boolean;
      marketing: boolean;
      account: boolean;
      accountUpdates?: boolean;
      newsletters?: boolean;
      productUpdates?: boolean;
    };
    sms?: {
      enabled?: boolean;
      transactions: boolean;
      security: boolean;
      marketing?: boolean;
      otp?: boolean;
    };
    push: {
      enabled?: boolean;
      transactions: boolean;
      security: boolean;
      marketing: boolean;
      account: boolean;
      accountUpdates?: boolean;
    };
    inApp?: {
      enabled?: boolean;
      transactions: boolean;
      security: boolean;
      marketing: boolean;
      accountUpdates?: boolean;
    };
    quietHours?: {
      enabled: boolean;
      startTime: string;
      endTime: string;
      timezone: string;
    };
    frequency?: {
      digest: 'realtime' | 'daily' | 'weekly' | 'never';
      summaryTime: string;
    };
  }
}

export {};
