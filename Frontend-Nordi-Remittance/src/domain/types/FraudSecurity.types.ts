// ============================================================================
// FRAUD SECURITY TYPES — Mirrors FraudSecurityModel.ts
// FraudSignal, FraudCase, VelocityRule, BehaviorProfile, SecurityEvent
// ============================================================================

declare global {
  interface FraudSignal extends Timestamps {
    signalId: UUID;
    user: UUID;
    transaction?: UUID;
    signalType: FraudSignalType;
    severity: FraudSignalSeverity;
    description: string;
    riskScore: number;
    detectedAt: ISO8601Date;
    status: FraudSignalStatus;
    notes?: string;
    reviewedBy?: string;
    reviewedAt?: ISO8601Date;
    resolvedAt?: ISO8601Date;
    resolvedBy?: string;
    resolution?: string;
    metadata?: Record<string, unknown>;
  }

  interface FraudCase extends Timestamps {
    caseId: UUID;
    user: UUID;
    caseType: FraudCaseType;
    status: FraudCaseStatus;
    priority: FraudCasePriority;
    severity: FraudSignalSeverity;
    assignedTo?: string;
    signals?: UUID[];
    transactions?: UUID[];
    evidences?: Array<{
      type: string;
      description: string;
      url?: string;
      uploadedAt: ISO8601Date;
    }>;
    notes?: Array<{ author: string; content: string; createdAt: ISO8601Date }>;
    actions?: Array<{
      action: string;
      performedBy: string;
      performedAt: ISO8601Date;
      details?: string;
    }>;
    timeline?: Array<{
      action: string;
      performedBy: string;
      timestamp: ISO8601Date;
      notes?: string;
    }>;
    resolution?: string;
    closedBy?: string;
    outcome?:
      | 'legitimate' | 'fraud_confirmed' | 'account_suspended'
      | 'account_closed' | 'law_enforcement_notified';
    openedAt: ISO8601Date;
    closedAt?: ISO8601Date;
  }

  interface VelocityRule extends Timestamps {
    ruleId: UUID;
    name: string;
    description: string;
    ruleType: 'transaction_count' | 'transaction_amount' | 'login_attempts' | 'failed_transactions';
    timeWindow: number;
    threshold: number;
    isActive: boolean;
    severity: 'low' | 'medium' | 'high';
    action: 'alert' | 'block' | 'review' | 'challenge';
    appliesTo: 'all' | 'new_users' | 'high_risk' | 'specific_countries';
    countries?: string[];
  }

  interface BehaviorProfile extends Timestamps {
    user: UUID;
    averageTransactionAmount: number;
    averageMonthlyTransactions: number;
    typicalTransactionHours: number[];
    typicalDaysOfWeek: number[];
    commonMerchants: string[];
    commonCountries: string[];
    commonDevices: Array<{
      deviceId: string;
      deviceType: string;
      os?: string;
      browser?: string;
      lastUsed: ISO8601Date;
    }>;
    commonIpRanges: string[];
    riskLevel: 'low' | 'medium' | 'high';
    lastUpdated: ISO8601Date;
  }

  interface SecurityEvent {
    eventId: UUID;
    user: UUID;
    eventType:
      | 'login' | 'login_success' | 'login_failed' | 'logout'
      | 'password_change' | 'password_reset'
      | '2fa_enabled' | '2fa_disabled' | '2fa_setup' | '2fa_verified'
      | 'device_added' | 'device_removed'
      | 'suspicious_login' | 'account_locked' | 'account_unlocked'
      | 'session_revoked' | 'all_sessions_revoked'
      | 'backup_codes_regenerated' | 'security_settings_updated';
    severity: 'info' | 'warning' | 'critical';
    ipAddress: string;
    userAgent: string;
    location?: {
      country?: string;
      city?: string;
      coordinates?: { lat: number; lng: number };
    };
    deviceInfo?: {
      deviceId?: string;
      deviceType?: string;
      os?: string;
      browser?: string;
    };
    metadata?: Record<string, unknown>;
    requiresAction: boolean;
    actionTaken?: string;
    createdAt: ISO8601Date;
  }
}

export {};
