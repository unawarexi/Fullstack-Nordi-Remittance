// ============================================================================
// LEGAL API - Disputes, reports, and legal compliance endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from '../client';

const LEGAL_BASE = '/legal';

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface DisputeFilters {
  status?: 'open' | 'under_review' | 'resolved' | 'rejected';
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateDisputeRequest {
  transactionId: UUID;
  type: 'unauthorized' | 'not_received' | 'wrong_amount' | 'duplicate' | 'other';
  description: string;
  amount?: number;
  documents?: UUID[];
}

export interface ReportFilters {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// LEGAL API FUNCTIONS
// ============================================================================

export const legalApi = {
  // ==========================================================================
  // DISPUTES
  // ==========================================================================

  /**
   * Get all disputes
   */
  getDisputes: async (params?: DisputeFilters): Promise<PaginatedResponse<Dispute>> => {
    const response = await apiClient.get<PaginatedResponse<Dispute>>(
      `${LEGAL_BASE}/disputes`,
      { params }
    );
    return response.data;
  },

  /**
   * Get dispute by ID
   */
  getDisputeById: async (disputeId: UUID): Promise<ApiResponse<Dispute & {
    transaction: {
      id: UUID;
      reference: string;
      amount: number;
      currency: Currency;
      date: string;
    };
    timeline: Array<{
      status: string;
      message: string;
      timestamp: string;
      actor?: string;
    }>;
    documents: Array<{
      id: UUID;
      name: string;
      url: string;
      uploadedAt: string;
    }>;
  }>> => {
    const response = await apiClient.get<ApiResponse<Dispute & {
      transaction: {
        id: UUID;
        reference: string;
        amount: number;
        currency: Currency;
        date: string;
      };
      timeline: Array<{
        status: string;
        message: string;
        timestamp: string;
        actor?: string;
      }>;
      documents: Array<{
        id: UUID;
        name: string;
        url: string;
        uploadedAt: string;
      }>;
    }>>(`${LEGAL_BASE}/disputes/${disputeId}`);
    return response.data;
  },

  /**
   * Create a new dispute
   */
  createDispute: async (data: CreateDisputeRequest): Promise<ApiResponse<Dispute>> => {
    const response = await apiClient.post<ApiResponse<Dispute>>(
      `${LEGAL_BASE}/disputes`,
      data
    );
    return response.data;
  },

  /**
   * Add document to dispute
   */
  addDisputeDocument: async (disputeId: UUID, file: File): Promise<ApiResponse<{
    id: UUID;
    url: string;
  }>> => {
    const formData = new FormData();
    formData.append('document', file);

    const response = await apiClient.post<ApiResponse<{
      id: UUID;
      url: string;
    }>>(`${LEGAL_BASE}/disputes/${disputeId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Add comment to dispute
   */
  addDisputeComment: async (disputeId: UUID, comment: string): Promise<ApiResponse<{
    id: UUID;
    comment: string;
    createdAt: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      id: UUID;
      comment: string;
      createdAt: string;
    }>>(`${LEGAL_BASE}/disputes/${disputeId}/comments`, { comment });
    return response.data;
  },

  /**
   * Cancel dispute
   */
  cancelDispute: async (disputeId: UUID, reason?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${LEGAL_BASE}/disputes/${disputeId}/cancel`,
      { reason }
    );
    return response.data;
  },

  // ==========================================================================
  // REPORTS
  // ==========================================================================

  /**
   * Get all reports
   */
  getReports: async (params?: ReportFilters): Promise<PaginatedResponse<Report>> => {
    const response = await apiClient.get<PaginatedResponse<Report>>(
      `${LEGAL_BASE}/reports`,
      { params }
    );
    return response.data;
  },

  /**
   * Get report by ID
   */
  getReportById: async (reportId: UUID): Promise<ApiResponse<Report>> => {
    const response = await apiClient.get<ApiResponse<Report>>(
      `${LEGAL_BASE}/reports/${reportId}`
    );
    return response.data;
  },

  /**
   * Request account statement
   */
  requestAccountStatement: async (data: {
    accountId: UUID;
    startDate: string;
    endDate: string;
    format: 'pdf' | 'csv';
  }): Promise<ApiResponse<Report>> => {
    const response = await apiClient.post<ApiResponse<Report>>(
      `${LEGAL_BASE}/reports/account-statement`,
      data
    );
    return response.data;
  },

  /**
   * Request transaction history report
   */
  requestTransactionHistory: async (data: {
    startDate: string;
    endDate: string;
    format: 'pdf' | 'csv';
    accountId?: UUID;
    type?: string;
  }): Promise<ApiResponse<Report>> => {
    const response = await apiClient.post<ApiResponse<Report>>(
      `${LEGAL_BASE}/reports/transaction-history`,
      data
    );
    return response.data;
  },

  /**
   * Request tax report
   */
  requestTaxReport: async (data: {
    year: number;
    format: 'pdf' | 'csv';
  }): Promise<ApiResponse<Report>> => {
    const response = await apiClient.post<ApiResponse<Report>>(
      `${LEGAL_BASE}/reports/tax`,
      data
    );
    return response.data;
  },

  /**
   * Download report
   */
  downloadReport: async (reportId: UUID): Promise<ApiResponse<{
    downloadUrl: string;
    expiresAt: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      downloadUrl: string;
      expiresAt: string;
    }>>(`${LEGAL_BASE}/reports/${reportId}/download`);
    return response.data;
  },

  // ==========================================================================
  // LEGAL DOCUMENTS
  // ==========================================================================

  /**
   * Get terms and conditions
   */
  getTermsAndConditions: async (): Promise<ApiResponse<{
    version: string;
    content: string;
    effectiveDate: string;
    lastUpdated: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      version: string;
      content: string;
      effectiveDate: string;
      lastUpdated: string;
    }>>(`${LEGAL_BASE}/documents/terms`);
    return response.data;
  },

  /**
   * Get privacy policy
   */
  getPrivacyPolicy: async (): Promise<ApiResponse<{
    version: string;
    content: string;
    effectiveDate: string;
    lastUpdated: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      version: string;
      content: string;
      effectiveDate: string;
      lastUpdated: string;
    }>>(`${LEGAL_BASE}/documents/privacy`);
    return response.data;
  },

  /**
   * Accept terms
   */
  acceptTerms: async (version: string): Promise<ApiResponse<{
    accepted: boolean;
    acceptedAt: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      accepted: boolean;
      acceptedAt: string;
    }>>(`${LEGAL_BASE}/documents/terms/accept`, { version });
    return response.data;
  },

  /**
   * Get regulatory disclosures
   */
  getRegulatoryDisclosures: async (): Promise<ApiResponse<Array<{
    id: UUID;
    title: string;
    content: string;
    category: string;
    effectiveDate: string;
  }>>> => {
    const response = await apiClient.get<ApiResponse<Array<{
      id: UUID;
      title: string;
      content: string;
      category: string;
      effectiveDate: string;
    }>>>(`${LEGAL_BASE}/documents/disclosures`);
    return response.data;
  },

  // ==========================================================================
  // CONSENT MANAGEMENT
  // ==========================================================================

  /**
   * Get consent status
   */
  getConsentStatus: async (): Promise<ApiResponse<{
    termsAccepted: boolean;
    termsVersion?: string;
    termsAcceptedAt?: string;
    privacyAccepted: boolean;
    privacyVersion?: string;
    privacyAcceptedAt?: string;
    marketingConsent: boolean;
    dataProcessingConsent: boolean;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      termsAccepted: boolean;
      termsVersion?: string;
      termsAcceptedAt?: string;
      privacyAccepted: boolean;
      privacyVersion?: string;
      privacyAcceptedAt?: string;
      marketingConsent: boolean;
      dataProcessingConsent: boolean;
    }>>(`${LEGAL_BASE}/consent`);
    return response.data;
  },

  /**
   * Update consent
   */
  updateConsent: async (data: {
    marketingConsent?: boolean;
    dataProcessingConsent?: boolean;
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.patch<ApiResponse<{ message: string }>>(
      `${LEGAL_BASE}/consent`,
      data
    );
    return response.data;
  },
};

export default legalApi;
