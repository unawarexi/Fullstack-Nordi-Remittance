// ============================================================================
// CONFIRM TYPES — Mirrors ConfirmModel.ts
// ConfirmationToken, LoginAttempt, SecurityEvent (confirm module),
// BlockedIP, UserDevice
// ============================================================================

declare global {
  interface ConfirmationToken {
    id: UUID;
    userId: UUID;
    token: string;
    type:
      | 'email_verification' | 'password_reset' | 'two_factor' | 'two_factor_setup'
      | 'phone_verification' | 'email_change' | 'phone_change'
      | 'account_deletion' | 'refresh_token';
    expiresAt: ISO8601Date;
    used: boolean;
    usedAt?: ISO8601Date;
    metadata?: Record<string, unknown>;
    createdAt: ISO8601Date;
  }

  interface LoginAttempt {
    id: UUID;
    userId?: UUID;
    email: string;
    ipAddress: string;
    userAgent?: string;
    success: boolean;
    reason?: string;
    location?: {
      country?: string;
      city?: string;
      region?: string;
    };
    createdAt: ISO8601Date;
  }

  interface ConfirmSecurityEvent {
    id: UUID;
    userId?: UUID;
    type:
      | 'login' | 'logout' | 'login_failed' | 'login_locked'
      | 'password_changed' | 'password_reset_requested' | 'password_reset_completed'
      | 'email_changed' | 'phone_changed'
      | 'two_factor_enabled' | 'two_factor_disabled' | 'two_factor_failed'
      | 'status_changed' | 'kyc_status_changed'
      | 'suspicious_activity' | 'account_locked' | 'account_unlocked' | 'account_deleted'
      | 'api_key_created' | 'api_key_revoked'
      | 'device_added' | 'device_removed'
      | 'transaction_flagged' | 'transaction_blocked'
      | 'ip_blocked' | 'ip_unblocked';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: {
      country?: string;
      city?: string;
      region?: string;
    };
    metadata?: Record<string, unknown>;
    resolved: boolean;
    resolvedAt?: ISO8601Date;
    resolvedBy?: string;
    createdAt: ISO8601Date;
  }

  interface BlockedIP {
    ipAddress: string;
    reason: string;
    blockedBy?: string;
    expiresAt?: ISO8601Date;
    permanent: boolean;
    createdAt: ISO8601Date;
  }

  interface UserDevice {
    userId: UUID;
    deviceId: string;
    deviceName?: string;
    deviceType?: 'mobile' | 'tablet' | 'desktop' | 'other';
    browser?: string;
    os?: string;
    ipAddress?: string;
    location?: {
      country?: string;
      city?: string;
    };
    trusted: boolean;
    lastActive: ISO8601Date;
    createdAt: ISO8601Date;
  }
}

export {};
