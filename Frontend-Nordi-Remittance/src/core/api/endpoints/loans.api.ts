// ============================================================================
// LOANS API - Loan management endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from '../client';
import type {
  Loan,
  LoanType,
  LoanStatus,
  LoanApplication,
  LoanPayment,
  LoanSchedule,
  UUID,
} from '../../../types/api.types';

const LOANS_BASE = '/loans';

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface LoanFilters {
  type?: LoanType;
  status?: LoanStatus | LoanStatus[];
  page?: number;
  limit?: number;
}

export interface LoanEligibilityRequest {
  type: LoanType;
  amount: number;
  term: number;
}

export interface LoanPaymentRequest {
  loanId: UUID;
  amount: number;
  sourceAccountId: UUID;
  pin: string;
}

// ============================================================================
// LOANS API FUNCTIONS
// ============================================================================

export const loansApi = {
  // ==========================================================================
  // LOAN MANAGEMENT
  // ==========================================================================

  /**
   * Get all user loans
   */
  getAll: async (params?: LoanFilters): Promise<PaginatedResponse<Loan>> => {
    const response = await apiClient.get<PaginatedResponse<Loan>>(
      LOANS_BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Get loan by ID
   */
  getById: async (loanId: UUID): Promise<ApiResponse<Loan>> => {
    const response = await apiClient.get<ApiResponse<Loan>>(
      `${LOANS_BASE}/${loanId}`
    );
    return response.data;
  },

  /**
   * Get active loans
   */
  getActive: async (): Promise<ApiResponse<Loan[]>> => {
    const response = await apiClient.get<ApiResponse<Loan[]>>(
      `${LOANS_BASE}/active`
    );
    return response.data;
  },

  /**
   * Get loan summary
   */
  getSummary: async (): Promise<ApiResponse<{
    totalLoans: number;
    activeLoans: number;
    totalBorrowed: number;
    totalPaid: number;
    totalOutstanding: number;
    nextPaymentDate?: string;
    nextPaymentAmount?: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      totalLoans: number;
      activeLoans: number;
      totalBorrowed: number;
      totalPaid: number;
      totalOutstanding: number;
      nextPaymentDate?: string;
      nextPaymentAmount?: number;
    }>>(`${LOANS_BASE}/summary`);
    return response.data;
  },

  // ==========================================================================
  // LOAN APPLICATION
  // ==========================================================================

  /**
   * Check loan eligibility
   */
  checkEligibility: async (data: LoanEligibilityRequest): Promise<ApiResponse<{
    eligible: boolean;
    maxAmount: number;
    minAmount: number;
    maxTerm: number;
    minTerm: number;
    interestRate: number;
    reasons?: string[];
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      eligible: boolean;
      maxAmount: number;
      minAmount: number;
      maxTerm: number;
      minTerm: number;
      interestRate: number;
      reasons?: string[];
    }>>(`${LOANS_BASE}/eligibility`, data);
    return response.data;
  },

  /**
   * Get loan calculator
   */
  calculate: async (data: {
    type: LoanType;
    amount: number;
    term: number;
  }): Promise<ApiResponse<{
    principal: number;
    interestRate: number;
    monthlyPayment: number;
    totalInterest: number;
    totalAmount: number;
    schedule: LoanSchedule[];
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      principal: number;
      interestRate: number;
      monthlyPayment: number;
      totalInterest: number;
      totalAmount: number;
      schedule: LoanSchedule[];
    }>>(`${LOANS_BASE}/calculate`, data);
    return response.data;
  },

  /**
   * Apply for a loan
   */
  apply: async (data: LoanApplication): Promise<ApiResponse<Loan>> => {
    const response = await apiClient.post<ApiResponse<Loan>>(
      `${LOANS_BASE}/apply`,
      data
    );
    return response.data;
  },

  /**
   * Get loan application status
   */
  getApplicationStatus: async (loanId: UUID): Promise<ApiResponse<{
    status: LoanStatus;
    currentStep: number;
    totalSteps: number;
    steps: Array<{
      name: string;
      status: 'pending' | 'in_progress' | 'completed' | 'failed';
      completedAt?: string;
    }>;
    estimatedApprovalDate?: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      status: LoanStatus;
      currentStep: number;
      totalSteps: number;
      steps: Array<{
        name: string;
        status: 'pending' | 'in_progress' | 'completed' | 'failed';
        completedAt?: string;
      }>;
      estimatedApprovalDate?: string;
    }>>(`${LOANS_BASE}/${loanId}/status`);
    return response.data;
  },

  /**
   * Cancel loan application
   */
  cancelApplication: async (loanId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${LOANS_BASE}/${loanId}/cancel`
    );
    return response.data;
  },

  // ==========================================================================
  // LOAN PRODUCTS
  // ==========================================================================

  /**
   * Get available loan products
   */
  getProducts: async (): Promise<ApiResponse<Array<{
    type: LoanType;
    name: string;
    description: string;
    minAmount: number;
    maxAmount: number;
    minTerm: number;
    maxTerm: number;
    interestRate: { min: number; max: number };
    processingFee: number;
    features: string[];
    requirements: string[];
    isAvailable: boolean;
  }>>> => {
    const response = await apiClient.get<ApiResponse<Array<{
      type: LoanType;
      name: string;
      description: string;
      minAmount: number;
      maxAmount: number;
      minTerm: number;
      maxTerm: number;
      interestRate: { min: number; max: number };
      processingFee: number;
      features: string[];
      requirements: string[];
      isAvailable: boolean;
    }>>>(`${LOANS_BASE}/products`);
    return response.data;
  },

  // ==========================================================================
  // PAYMENTS
  // ==========================================================================

  /**
   * Make loan payment
   */
  makePayment: async (data: LoanPaymentRequest): Promise<ApiResponse<{
    payment: LoanPayment;
    loan: Loan;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      payment: LoanPayment;
      loan: Loan;
    }>>(`${LOANS_BASE}/payments`, data);
    return response.data;
  },

  /**
   * Get loan payments history
   */
  getPayments: async (loanId: UUID, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<LoanPayment>> => {
    const response = await apiClient.get<PaginatedResponse<LoanPayment>>(
      `${LOANS_BASE}/${loanId}/payments`,
      { params }
    );
    return response.data;
  },

  /**
   * Get payment schedule
   */
  getSchedule: async (loanId: UUID): Promise<ApiResponse<LoanSchedule[]>> => {
    const response = await apiClient.get<ApiResponse<LoanSchedule[]>>(
      `${LOANS_BASE}/${loanId}/schedule`
    );
    return response.data;
  },

  /**
   * Setup auto-payment
   */
  setupAutoPayment: async (loanId: UUID, data: {
    sourceAccountId: UUID;
    dayOfMonth: number;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${LOANS_BASE}/${loanId}/auto-payment`,
      data
    );
    return response.data;
  },

  /**
   * Cancel auto-payment
   */
  cancelAutoPayment: async (loanId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${LOANS_BASE}/${loanId}/auto-payment`
    );
    return response.data;
  },

  // ==========================================================================
  // LOAN ACTIONS
  // ==========================================================================

  /**
   * Get payoff quote
   */
  getPayoffQuote: async (loanId: UUID): Promise<ApiResponse<{
    principalRemaining: number;
    accruedInterest: number;
    fees: number;
    totalPayoff: number;
    validUntil: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      principalRemaining: number;
      accruedInterest: number;
      fees: number;
      totalPayoff: number;
      validUntil: string;
    }>>(`${LOANS_BASE}/${loanId}/payoff-quote`);
    return response.data;
  },

  /**
   * Request payment deferral
   */
  requestDeferral: async (loanId: UUID, data: {
    months: number;
    reason: string;
  }): Promise<ApiResponse<{ message: string; requestId: UUID }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string; requestId: UUID }>>(
      `${LOANS_BASE}/${loanId}/deferral`,
      data
    );
    return response.data;
  },

  /**
   * Request loan refinancing
   */
  requestRefinance: async (loanId: UUID, data: {
    newTerm?: number;
    newAmount?: number;
    reason: string;
  }): Promise<ApiResponse<{ message: string; requestId: UUID }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string; requestId: UUID }>>(
      `${LOANS_BASE}/${loanId}/refinance`,
      data
    );
    return response.data;
  },

  // ==========================================================================
  // DOCUMENTS
  // ==========================================================================

  /**
   * Get loan documents
   */
  getDocuments: async (loanId: UUID): Promise<ApiResponse<Array<{
    id: UUID;
    name: string;
    type: string;
    url: string;
    createdAt: string;
  }>>> => {
    const response = await apiClient.get<ApiResponse<Array<{
      id: UUID;
      name: string;
      type: string;
      url: string;
      createdAt: string;
    }>>>(`${LOANS_BASE}/${loanId}/documents`);
    return response.data;
  },

  /**
   * Upload loan document
   */
  uploadDocument: async (loanId: UUID, file: File, type: string): Promise<ApiResponse<{
    id: UUID;
    url: string;
  }>> => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);

    const response = await apiClient.post<ApiResponse<{
      id: UUID;
      url: string;
    }>>(`${LOANS_BASE}/${loanId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default loansApi;
