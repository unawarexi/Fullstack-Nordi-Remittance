// ============================================================================
// AUDIT TYPES — Mirrors AuditModels.ts
// AuditLog, ActivityLog, DataAccessLog, ErrorLog, WebhookEvent,
// ComplianceReport, SystemAuditTrail
// ============================================================================

declare global {
  interface AuditLog {
    logId: UUID;
    eventType: 'user_action' | 'system_action' | 'transaction' | 'security' | 'compliance' | 'data_change';
    action: string;
    actor: string;
    actorType: 'user' | 'admin' | 'system';
    resource: string;
    resourceId: string;
    changes?: {
      before?: Record<string, unknown>;
      after?: Record<string, unknown>;
    };
    ipAddress?: string;
    userAgent?: string;
    location?: {
      country?: string;
      city?: string;
    };
    severity: 'info' | 'warning' | 'error' | 'critical';
    status: 'success' | 'failed';
    errorMessage?: string;
    metadata?: Record<string, unknown>;
    createdAt: ISO8601Date;
  }

  interface ActivityLog {
    activityId: UUID;
    user: UUID;
    activityType: 'login' | 'logout' | 'transaction' | 'profile_update' | 'settings_change' | 'view' | 'download' | 'other';
    description: string;
    ipAddress: string;
    userAgent: string;
    deviceInfo: {
      deviceId?: string;
      deviceType: string;
      os: string;
      browser?: string;
    };
    location?: {
      country?: string;
      city?: string;
      coordinates?: { lat: number; lng: number };
    };
    metadata?: Record<string, unknown>;
    createdAt: ISO8601Date;
  }

  interface DataAccessLog {
    accessId: UUID;
    accessor: string;
    accessorType: 'user' | 'admin' | 'system';
    dataOwner: UUID;
    dataType: 'pii' | 'financial' | 'kyc' | 'transaction' | 'document' | 'other';
    accessReason: string;
    accessMethod: 'view' | 'export' | 'modify' | 'delete';
    dataFields: string[];
    ipAddress: string;
    userAgent: string;
    consentObtained: boolean;
    legalBasis?: string;
    retentionPeriod?: number;
    metadata?: Record<string, unknown>;
    createdAt: ISO8601Date;
  }

  interface ErrorLogEntry {
    errorId: UUID;
    errorType: 'application' | 'database' | 'network' | 'external_api' | 'validation' | 'authentication' | 'authorization';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    stackTrace?: string;
    userId?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    requestBody?: Record<string, unknown>;
    responseBody?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    environment: 'development' | 'staging' | 'production';
    isResolved: boolean;
    resolvedAt?: ISO8601Date;
    resolvedBy?: string;
    resolution?: string;
    createdAt: ISO8601Date;
  }

  interface WebhookEventEntry {
    eventId: UUID;
    provider: string;
    eventType: string;
    eventData: Record<string, unknown>;
    webhookUrl: string;
    httpMethod: string;
    headers: Record<string, string>;
    status: 'received' | 'processing' | 'processed' | 'failed' | 'retrying';
    attempts: number;
    maxAttempts: number;
    lastAttemptAt?: ISO8601Date;
    nextRetryAt?: ISO8601Date;
    processedAt?: ISO8601Date;
    failureReason?: string;
    responseStatus?: number;
    responseBody?: string;
    signature?: string;
    signatureVerified: boolean;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface ComplianceReport {
    reportId: UUID;
    reportType: 'transaction_monitoring' | 'kyc_compliance' | 'suspicious_activity' | 'regulatory' | 'aml' | 'other';
    title: string;
    description?: string;
    periodStart: ISO8601Date;
    periodEnd: ISO8601Date;
    data: Record<string, unknown>;
    findings: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      count: number;
      description: string;
    }>;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    generatedBy: UUID;
    generatedAt: ISO8601Date;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface SystemAuditTrail {
    trailId: UUID;
    component: string;
    eventType: 'startup' | 'shutdown' | 'config_change' | 'deployment' | 'error' | 'warning' | 'info' | 'other';
    description: string;
    metadata?: Record<string, unknown>;
    severity: 'info' | 'warning' | 'error' | 'critical';
    timestamp: ISO8601Date;
    createdAt: ISO8601Date;
  }
}

export {};
