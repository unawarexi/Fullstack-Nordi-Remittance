// ============================================================================
// LOANS API - Loan management endpoints
// ============================================================================

import { ApiEndpoints } from "../../core/api/endpoint";
import apiClient, { ApiResponse, PaginatedResponse } from "@core/api/client";

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

export const LoansRepository = {
  // ==========================================================================
  // LOAN MANAGEMENT
  // ==========================================================================

  /**
   * Get all user loans
   */
  getAll: async (params?: LoanFilters): Promise<PaginatedResponse<Loan>> => {
    const response = await apiClient.get<PaginatedResponse<Loan>>("/loans", { params });
    return response.data;
  },

  /**
   * Get loan by ID
   */
  getById: async (loanId: UUID): Promise<ApiResponse<Loan>> => {
    const response = await apiClient.get<ApiResponse<Loan>>(ApiEndpoints.loan(loanId));
    return response.data;
  },

  /**
   * Get active loans
   */
  getActive: async (): Promise<ApiResponse<Loan[]>> => {
    const response = await apiClient.get<ApiResponse<Loan[]>>(ApiEndpoints.loansActive);
    return response.data;
  },

  /**
   * Get loan summary
   */
  getSummary: async (): Promise<
    ApiResponse<{
      totalLoans: number;
      activeLoans: number;
      totalBorrowed: number;
      totalPaid: number;
      totalOutstanding: number;
      nextPaymentDate?: string;
      nextPaymentAmount?: number;
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{
        totalLoans: number;
        activeLoans: number;
        totalBorrowed: number;
        totalPaid: number;
        totalOutstanding: number;
        nextPaymentDate?: string;
        nextPaymentAmount?: number;
      }>
    >(ApiEndpoints.loansSummary);
    return response.data;
  },

  // ==========================================================================
  // LOAN APPLICATION
  // ==========================================================================

  /**
   * Check loan eligibility
   */
  checkEligibility: async (
    data: LoanEligibilityRequest,
  ): Promise<
    ApiResponse<{
      eligible: boolean;
      maxAmount: number;
      minAmount: number;
      maxTerm: number;
      minTerm: number;
      interestRate: number;
      reasons?: string[];
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        eligible: boolean;
        maxAmount: number;
        minAmount: number;
        maxTerm: number;
        minTerm: number;
        interestRate: number;
        reasons?: string[];
      }>
    >(ApiEndpoints.loansEligibility, data);
    return response.data;
  },

  /**
   * Get loan calculator
   */
  calculate: async (data: {
    type: LoanType;
    amount: number;
    term: number;
  }): Promise<
    ApiResponse<{
      principal: number;
      interestRate: number;
      monthlyPayment: number;
      totalInterest: number;
      totalAmount: number;
      schedule: LoanSchedule[];
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        principal: number;
        interestRate: number;
        monthlyPayment: number;
        totalInterest: number;
        totalAmount: number;
        schedule: LoanSchedule[];
      }>
    >(ApiEndpoints.loansCalculate, data);
    return response.data;
  },

  /**
   * Apply for a loan
   */
  apply: async (data: LoanApplication): Promise<ApiResponse<Loan>> => {
    const response = await apiClient.post<ApiResponse<Loan>>(ApiEndpoints.loansApply, data);
    return response.data;
  },

  /**
   * Get loan application status
   */
  getApplicationStatus: async (
    loanId: UUID,
  ): Promise<
    ApiResponse<{
      status: LoanStatus;
      currentStep: number;
      totalSteps: number;
      steps: Array<{
        name: string;
        status: "pending" | "in_progress" | "completed" | "failed";
        completedAt?: string;
      }>;
      estimatedApprovalDate?: string;
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{
        status: LoanStatus;
        currentStep: number;
        totalSteps: number;
        steps: Array<{
          name: string;
          status: "pending" | "in_progress" | "completed" | "failed";
          completedAt?: string;
        }>;
        estimatedApprovalDate?: string;
      }>
    >(ApiEndpoints.loanStatus(loanId));
    return response.data;
  },

  /**
   * Cancel loan application
   */
  cancelApplication: async (loanId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(ApiEndpoints.loanCancel(loanId));
    return response.data;
  },

  // ==========================================================================
  // LOAN PRODUCTS
  // ==========================================================================

  /**
   * Get available loan products
   */
  getProducts: async (): Promise<
    ApiResponse<
      Array<{
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
      }>
    >
  > => {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
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
        }>
      >
    >(ApiEndpoints.loansProducts);
    return response.data;
  },

  // ==========================================================================
  // PAYMENTS
  // ==========================================================================

  /**
   * Make loan payment
   */
  makePayment: async (
    data: LoanPaymentRequest,
  ): Promise<
    ApiResponse<{
      payment: LoanPayment;
      loan: Loan;
    }>
  > => {
    const response = await apiClient.post<
      ApiResponse<{
        payment: LoanPayment;
        loan: Loan;
      }>
    >(ApiEndpoints.loansPayments, data);
    return response.data;
  },

  /**
   * Get loan payments history
   */
  getPayments: async (
    loanId: UUID,
    params?: {
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponse<LoanPayment>> => {
    const response = await apiClient.get<PaginatedResponse<LoanPayment>>(ApiEndpoints.loanPayments(loanId), {
      params,
    });
    return response.data;
  },

  /**
   * Get payment schedule
   */
  getSchedule: async (loanId: UUID): Promise<ApiResponse<LoanSchedule[]>> => {
    const response = await apiClient.get<ApiResponse<LoanSchedule[]>>(ApiEndpoints.loanSchedule(loanId));
    return response.data;
  },

  /**
   * Setup auto-payment
   */
  setupAutoPayment: async (
    loanId: UUID,
    data: {
      sourceAccountId: UUID;
      dayOfMonth: number;
    },
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      ApiEndpoints.loanAutoPayment(loanId),
      data,
    );
    return response.data;
  },

  /**
   * Cancel auto-payment
   */
  cancelAutoPayment: async (loanId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(ApiEndpoints.loanAutoPayment(loanId));
    return response.data;
  },

  // ==========================================================================
  // LOAN ACTIONS
  // ==========================================================================

  /**
   * Get payoff quote
   */
  getPayoffQuote: async (
    loanId: UUID,
  ): Promise<
    ApiResponse<{
      principalRemaining: number;
      accruedInterest: number;
      fees: number;
      totalPayoff: number;
      validUntil: string;
    }>
  > => {
    const response = await apiClient.get<
      ApiResponse<{
        principalRemaining: number;
        accruedInterest: number;
        fees: number;
        totalPayoff: number;
        validUntil: string;
      }>
    >(ApiEndpoints.loanPayoffQuote(loanId));
    return response.data;
  },

  /**
   * Request payment deferral
   */
  requestDeferral: async (
    loanId: UUID,
    data: {
      months: number;
      reason: string;
    },
  ): Promise<ApiResponse<{ message: string; requestId: UUID }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string; requestId: UUID }>>(
      ApiEndpoints.loanDeferral(loanId),
      data,
    );
    return response.data;
  },

  /**
   * Request loan refinancing
   */
  requestRefinance: async (
    loanId: UUID,
    data: {
      newTerm?: number;
      newAmount?: number;
      reason: string;
    },
  ): Promise<ApiResponse<{ message: string; requestId: UUID }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string; requestId: UUID }>>(
      ApiEndpoints.loanRefinance(loanId),
      data,
    );
    return response.data;
  },

  // ==========================================================================
  // DOCUMENTS
  // ==========================================================================

  /**
   * Get loan documents
   */
  getDocuments: async (
    loanId: UUID,
  ): Promise<
    ApiResponse<
      Array<{
        id: UUID;
        name: string;
        type: string;
        url: string;
        createdAt: string;
      }>
    >
  > => {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          id: UUID;
          name: string;
          type: string;
          url: string;
          createdAt: string;
        }>
      >
    >(ApiEndpoints.loanDocuments(loanId));
    return response.data;
  },

  /**
   * Upload loan document
   */
  uploadDocument: async (
    loanId: UUID,
    file: File,
    type: string,
  ): Promise<
    ApiResponse<{
      id: UUID;
      url: string;
    }>
  > => {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("type", type);

    const response = await apiClient.post<
      ApiResponse<{
        id: UUID;
        url: string;
      }>
    >(ApiEndpoints.loanDocuments(loanId), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default LoansRepository;
