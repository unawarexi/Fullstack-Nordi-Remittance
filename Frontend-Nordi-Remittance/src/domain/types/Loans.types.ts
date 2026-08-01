// ============================================================================
// LOANS TYPES — Mirrors LoansModel.ts
// Loan, LoanApplication, CreditAssessment, RepaymentSchedule,
// LoanRepayment, Collateral
// ============================================================================

declare global {
  interface Loan extends Timestamps {
    id: UUID;
    loanId?: UUID;
    userId: UUID;
    user?: UUID;
    wallet?: UUID;
    loanNumber: string;
    type: LoanType;
    loanType?: LoanType;
    status: LoanStatus;
    principal: number;
    principalAmount?: number;
    outstandingBalance?: number;
    interestRate: number;
    currency: Currency;
    term: number;
    startDate?: ISO8601Date;
    maturityDate?: ISO8601Date;
    monthlyPayment: number;
    totalInterest: number;
    totalAmount: number;
    totalRepayment?: number;
    amountPaid: number;
    remainingBalance: number;
    nextPaymentDate?: ISO8601Date;
    nextPaymentAmount?: number;
    disbursementDate?: ISO8601Date;
    disbursementMethod?: 'bank_transfer' | 'wallet' | 'check';
    disbursementAccount?: string;
    disbursementAccountId?: UUID;
    purpose?: string;
    collateral?: string;
    hasCollateral?: boolean;
    creditScore?: number;
    missedPayments?: number;
    latePayments?: number;
    gracePeriodDays?: number;
    lateFeePercentage?: number;
    earlyRepaymentAllowed?: boolean;
    earlyRepaymentPenalty?: number;
    insuranceRequired?: boolean;
    insuranceProvider?: string;
    insurancePremium?: number;
    metadata?: Record<string, unknown>;
    approvedBy?: string;
    approvedAt?: ISO8601Date;
    rejectedReason?: string;
    closedAt?: ISO8601Date;
  }

  interface LoanApplication {
    applicationId?: UUID;
    user?: UUID;
    type: LoanType;
    loanType?: LoanType;
    amount: number;
    requestedAmount?: number;
    term: number;
    purpose: string;
    status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
    monthlyIncome: number;
    employmentStatus: string;
    employer?: string;
    disbursementAccountId: UUID;
    employmentInfo?: {
      employmentStatus: string;
      employer?: string;
      occupation: string;
      monthlyIncome: number;
      yearsEmployed?: number;
    };
    financialInfo?: {
      monthlyExpenses: number;
      existingDebts: number;
      assets: number;
      bankStatements?: string[];
    };
    creditCheck?: {
      creditScore?: number;
      creditReportProvider?: string;
      creditReportDate?: ISO8601Date;
    };
    documents?: Array<{
      type: string;
      filename: string;
      url: string;
      uploadedAt: ISO8601Date;
    }>;
    reviewNotes?: string;
    reviewedBy?: string;
    reviewedAt?: ISO8601Date;
    approvalNotes?: string;
    approvedAmount?: number;
    approvedRate?: number;
    approvedTerm?: number;
    rejectionReason?: string;
    loan?: UUID;
    submittedAt?: ISO8601Date;
    createdAt?: ISO8601Date;
    updatedAt?: ISO8601Date;
  }

  interface CreditAssessment {
    user: UUID;
    loanApplication: UUID;
    creditScore: number;
    creditReportProvider: string;
    creditReportDate: ISO8601Date;
    debtToIncomeRatio: number;
    employmentStability: 'excellent' | 'good' | 'fair' | 'poor';
    paymentHistory: 'excellent' | 'good' | 'fair' | 'poor';
    existingDebts: number;
    monthlyIncome: number;
    riskScore: number;
    riskCategory: 'low' | 'medium' | 'high' | 'very_high';
    recommendation: 'approve' | 'approve_with_conditions' | 'reject';
    recommendedAmount?: number;
    recommendedRate?: number;
    recommendedTerm?: number;
    conditions?: string[];
    assessedBy: string;
    assessmentNotes?: string;
    createdAt: ISO8601Date;
  }

  interface RepaymentSchedule extends Timestamps {
    loan: UUID;
    installments: Array<{
      installmentNumber: number;
      dueDate: ISO8601Date;
      principalAmount: number;
      interestAmount: number;
      totalAmount: number;
      status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
      paidAmount?: number;
      paidDate?: ISO8601Date;
      lateFee: number;
      remainingBalance: number;
    }>;
    totalPrincipal: number;
    totalInterest: number;
    totalAmount: number;
  }

  interface LoanRepayment {
    repaymentId: UUID;
    loan: UUID;
    installmentNumber?: number;
    amount: number;
    principalPaid: number;
    interestPaid: number;
    lateFee: number;
    currency: string;
    paymentMethod: 'auto_debit' | 'manual_transfer' | 'wallet' | 'card' | 'bank_transfer';
    transaction?: UUID;
    status: 'pending' | 'completed' | 'failed' | 'reversed';
    isEarlyRepayment: boolean;
    earlyRepaymentPenalty?: number;
    remainingBalance: number;
    paymentDate: ISO8601Date;
    scheduledDate?: ISO8601Date;
    failureReason?: string;
    metadata?: Record<string, unknown>;
    createdAt: ISO8601Date;
  }

  interface Collateral extends Timestamps {
    loan: UUID;
    collateralType: 'property' | 'vehicle' | 'securities' | 'equipment' | 'inventory' | 'other';
    description: string;
    estimatedValue: number;
    currency: string;
    appraisalValue?: number;
    appraisalDate?: ISO8601Date;
    appraisedBy?: string;
    documents?: Array<{
      type: string;
      filename: string;
      url: string;
      uploadedAt: ISO8601Date;
    }>;
    ownership: {
      ownerName: string;
      registrationNumber?: string;
      location?: string;
    };
    status: 'active' | 'released' | 'seized' | 'liquidated';
    releasedAt?: ISO8601Date;
    seizedAt?: ISO8601Date;
    seizedReason?: string;
    liquidationValue?: number;
    liquidatedAt?: ISO8601Date;
  }

  // Legacy interfaces for backward compat
  interface LoanPayment extends Timestamps {
    id: UUID;
    loanId: UUID;
    amount: number;
    principal: number;
    interest: number;
    fees: number;
    paymentDate: ISO8601Date;
    status: 'pending' | 'completed' | 'failed';
    transactionId?: UUID;
  }

  interface LoanSchedule {
    paymentNumber: number;
    dueDate: ISO8601Date;
    principal: number;
    interest: number;
    totalPayment: number;
    remainingBalance: number;
    status: 'upcoming' | 'paid' | 'overdue' | 'partial';
  }
}

export {};
