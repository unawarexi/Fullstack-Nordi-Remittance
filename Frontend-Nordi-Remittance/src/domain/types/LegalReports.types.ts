// ============================================================================
// LEGAL REPORTS TYPES — Mirrors LegalReportsModel.ts
// Statement, TaxRecord, RegulatoryReport, Dispute, Chargeback,
// LegalDocument, UserConsent, PolicyVersion, DisputeClaim, RegulatoryFiling
// ============================================================================

declare global {
  interface Statement {
    statementId: UUID;
    user: UUID;
    wallet: UUID;
    statementType: 'monthly' | 'quarterly' | 'annual' | 'custom';
    startDate: ISO8601Date;
    endDate: ISO8601Date;
    currency: string;
    openingBalance: number;
    closingBalance: number;
    totalCredits: number;
    totalDebits: number;
    transactions?: UUID[];
    generatedAt: ISO8601Date;
    fileUrl?: string;
    fileFormat: 'pdf' | 'csv' | 'excel';
    downloadCount: number;
    lastDownloadedAt?: ISO8601Date;
    isArchived: boolean;
    archivedAt?: ISO8601Date;
    createdAt: ISO8601Date;
  }

  interface TaxRecord extends Timestamps {
    taxRecordId: UUID;
    user: UUID;
    taxYear: number;
    taxCountry: string;
    totalIncome: number;
    totalExpenses: number;
    taxableIncome: number;
    estimatedTax: number;
    currency: string;
    transactionCount: number;
    interestEarned: number;
    capitalGains: number;
    capitalLosses: number;
    dividends: number;
    foreignIncome: number;
    categories: {
      business: number;
      investment: number;
      salary: number;
      freelance: number;
      rental: number;
      other: number;
    };
    fileUrl?: string;
    status: 'draft' | 'finalized' | 'filed' | 'amended';
    filedDate?: ISO8601Date;
    filedBy?: string;
    amendmentReason?: string;
    metadata?: Record<string, unknown>;
  }

  interface RegulatoryReport extends Timestamps {
    reportId: UUID;
    reportType: 'suspicious_activity' | 'large_transaction' | 'cross_border' | 'aml_compliance' | 'quarterly_return' | 'annual_return' | 'other';
    regulatorName: string;
    reportingPeriod: {
      startDate: ISO8601Date;
      endDate: ISO8601Date;
    };
    submissionDeadline: ISO8601Date;
    status: 'pending' | 'in_progress' | 'submitted' | 'accepted' | 'rejected';
    reportData: Record<string, unknown>;
    affectedUsers?: string[];
    affectedTransactions?: UUID[];
    totalAmount?: number;
    currency?: string;
    fileUrl?: string;
    submittedAt?: ISO8601Date;
    submittedBy?: string;
    acknowledgementNumber?: string;
    rejectionReason?: string;
    notes?: string;
  }

  interface Dispute extends Timestamps {
    id: UUID;
    disputeId?: UUID;
    userId: UUID;
    user?: UUID;
    transactionId: UUID;
    transaction?: UUID;
    type: DisputeType;
    disputeType?: DisputeType;
    status: DisputeStatus;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    amount: number;
    currency: Currency;
    description: string;
    evidences?: Array<{
      type: string;
      description: string;
      fileUrl: string;
      uploadedAt: ISO8601Date;
    }>;
    timeline?: Array<{
      status: string;
      notes: string;
      updatedBy: string;
      updatedAt: ISO8601Date;
    }>;
    assignedTo?: string;
    resolution?: string;
    resolutionType?: 'refund' | 'partial_refund' | 'no_refund' | 'reversal' | 'other';
    refundAmount?: number;
    resolvedAt?: ISO8601Date;
    openedAt?: ISO8601Date;
    closedAt?: ISO8601Date;
    dueDate?: ISO8601Date;
    merchantResponse?: string;
    internalNotes?: string;
    documents: UUID[];
  }

  interface Chargeback extends Timestamps {
    chargebackId: UUID;
    user: UUID;
    card: UUID;
    transaction: UUID;
    cardTransaction?: UUID;
    amount: number;
    currency: string;
    reasonCode: string;
    reasonDescription: string;
    chargebackType: 'fraud' | 'authorization' | 'processing_error' | 'consumer_dispute' | 'other';
    status: 'received' | 'under_review' | 'pending_merchant_response' | 'won' | 'lost' | 'withdrawn' | 'arbitration';
    filedDate: ISO8601Date;
    dueDate: ISO8601Date;
    merchant?: UUID;
    merchantName: string;
    merchantResponse?: string;
    merchantResponseDate?: ISO8601Date;
    evidences?: Array<{
      type: string;
      description: string;
      fileUrl: string;
      uploadedAt: ISO8601Date;
    }>;
    timeline?: Array<{
      status: string;
      notes: string;
      updatedBy: string;
      updatedAt: ISO8601Date;
    }>;
    outcome?: 'customer_favor' | 'merchant_favor' | 'split_liability';
    finalAmount?: number;
    fees: number;
    issuingBank?: string;
    acquiringBank?: string;
    caseNumber?: string;
    arbitrationDate?: ISO8601Date;
    closedAt?: ISO8601Date;
    internalNotes?: string;
  }

  interface LegalDocument extends Timestamps {
    documentId: UUID;
    title: string;
    documentType: 'terms' | 'privacy' | 'cookie' | 'aml' | 'kyc' | 'user_agreement' | 'other';
    content: string;
    summary?: string;
    version: string;
    effectiveDate: ISO8601Date;
    requiresConsent: boolean;
    status: 'draft' | 'active' | 'archived';
    createdBy?: UUID;
    updatedBy?: UUID;
  }

  interface UserConsent extends Timestamps {
    consentId: UUID;
    user: UUID;
    document: UUID;
    documentType: string;
    documentVersion: string;
    consentType: 'explicit' | 'implicit' | 'opt_in' | 'opt_out';
    accepted: boolean;
    consentDate: ISO8601Date;
    withdrawnAt?: ISO8601Date;
    ipAddress?: string;
    userAgent?: string;
  }

  interface PolicyVersion {
    versionId: UUID;
    documentType: string;
    version: string;
    documentId: UUID;
    changes: string;
    effectiveDate: ISO8601Date;
    createdBy?: UUID;
    createdAt: ISO8601Date;
  }

  interface DisputeClaim extends Timestamps {
    claimId: UUID;
    user: UUID;
    transaction: UUID;
    claimType: DisputeType;
    status: DisputeStatus;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    amount: number;
    currency: string;
    description: string;
    evidences?: Array<{
      type: string;
      description: string;
      fileUrl: string;
      uploadedAt: ISO8601Date;
    }>;
    timeline?: Array<{
      status: string;
      notes: string;
      updatedBy: string;
      updatedAt: ISO8601Date;
    }>;
    assignedTo?: string;
    resolution?: string;
    resolutionType?: 'refund' | 'partial_refund' | 'no_refund' | 'reversal' | 'other';
    refundAmount?: number;
    openedAt: ISO8601Date;
    closedAt?: ISO8601Date;
    dueDate?: ISO8601Date;
    internalNotes?: string;
  }

  interface RegulatoryFiling extends Timestamps {
    filingId: UUID;
    filingType: 'suspicious_activity' | 'large_transaction' | 'cross_border' | 'aml_compliance' | 'quarterly_return' | 'annual_return' | 'ctr' | 'sar' | 'other';
    regulatorName: string;
    jurisdiction: string;
    reportingPeriod: {
      startDate: ISO8601Date;
      endDate: ISO8601Date;
    };
    submissionDeadline: ISO8601Date;
    status: 'pending' | 'in_progress' | 'submitted' | 'accepted' | 'rejected';
    filingData: Record<string, unknown>;
    affectedUsers?: string[];
    affectedTransactions?: UUID[];
    totalAmount?: number;
    currency?: string;
    fileUrl?: string;
    submittedAt?: ISO8601Date;
    submittedBy?: string;
    acknowledgementNumber?: string;
    rejectionReason?: string;
    notes?: string;
  }

  interface AppReport extends Timestamps {
    id: UUID;
    userId: UUID;
    type: 'account_statement' | 'transaction_history' | 'tax_report' | 'audit_report';
    status: 'pending' | 'generating' | 'ready' | 'failed';
    parameters: Record<string, unknown>;
    downloadUrl?: string;
    expiresAt?: ISO8601Date;
  }
}

export {};
