// ============================================================================
// KYC API - Know Your Customer verification endpoints
// ============================================================================

import apiClient, { ApiResponse } from '../client';

const KYC_BASE = '/kyc';

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface PersonalInfoRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  nationality: string;
  placeOfBirth?: string;
}

export interface AddressInfoRequest {
  street: string;
  unit?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  residencySince?: string;
  residencyType?: 'own' | 'rent' | 'other';
}

export interface EmploymentInfoRequest {
  status: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student';
  employer?: string;
  jobTitle?: string;
  industry?: string;
  annualIncome: number;
  sourceOfFunds: string;
}

// ============================================================================
// KYC API FUNCTIONS
// ============================================================================

export const kycApi = {
  // ==========================================================================
  // KYC STATUS
  // ==========================================================================

  /**
   * Get KYC status
   */
  getStatus: async (): Promise<ApiResponse<{
    status: KycStatus;
    level: KycLevel;
    completedSteps: string[];
    pendingSteps: string[];
    rejectedSteps: Array<{
      step: string;
      reason: string;
    }>;
    limits: {
      dailyTransaction: number;
      monthlyTransaction: number;
      maxBalance: number;
    };
    expiresAt?: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      status: KycStatus;
      level: KycLevel;
      completedSteps: string[];
      pendingSteps: string[];
      rejectedSteps: Array<{
        step: string;
        reason: string;
      }>;
      limits: {
        dailyTransaction: number;
        monthlyTransaction: number;
        maxBalance: number;
      };
      expiresAt?: string;
    }>>(`${KYC_BASE}/status`);
    return response.data;
  },

  /**
   * Get KYC requirements for next level
   */
  getRequirements: async (targetLevel?: KycLevel): Promise<ApiResponse<{
    currentLevel: KycLevel;
    targetLevel: KycLevel;
    requirements: Array<{
      step: string;
      name: string;
      description: string;
      required: boolean;
      status: 'pending' | 'submitted' | 'approved' | 'rejected';
    }>;
    benefits: string[];
    newLimits: {
      dailyTransaction: number;
      monthlyTransaction: number;
      maxBalance: number;
    };
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      currentLevel: KycLevel;
      targetLevel: KycLevel;
      requirements: Array<{
        step: string;
        name: string;
        description: string;
        required: boolean;
        status: 'pending' | 'submitted' | 'approved' | 'rejected';
      }>;
      benefits: string[];
      newLimits: {
        dailyTransaction: number;
        monthlyTransaction: number;
        maxBalance: number;
      };
    }>>(`${KYC_BASE}/requirements`, {
      params: targetLevel ? { targetLevel } : undefined,
    });
    return response.data;
  },

  // ==========================================================================
  // PERSONAL INFORMATION
  // ==========================================================================

  /**
   * Submit personal information
   */
  submitPersonalInfo: async (data: PersonalInfoRequest): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${KYC_BASE}/personal-info`,
      data
    );
    return response.data;
  },

  /**
   * Get personal information
   */
  getPersonalInfo: async (): Promise<ApiResponse<PersonalInfoRequest & { status: string }>> => {
    const response = await apiClient.get<ApiResponse<PersonalInfoRequest & { status: string }>>(
      `${KYC_BASE}/personal-info`
    );
    return response.data;
  },

  // ==========================================================================
  // ADDRESS VERIFICATION
  // ==========================================================================

  /**
   * Submit address information
   */
  submitAddress: async (data: AddressInfoRequest): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${KYC_BASE}/address`,
      data
    );
    return response.data;
  },

  /**
   * Get address information
   */
  getAddress: async (): Promise<ApiResponse<AddressInfoRequest & { status: string }>> => {
    const response = await apiClient.get<ApiResponse<AddressInfoRequest & { status: string }>>(
      `${KYC_BASE}/address`
    );
    return response.data;
  },

  // ==========================================================================
  // EMPLOYMENT INFORMATION
  // ==========================================================================

  /**
   * Submit employment information
   */
  submitEmployment: async (data: EmploymentInfoRequest): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${KYC_BASE}/employment`,
      data
    );
    return response.data;
  },

  /**
   * Get employment information
   */
  getEmployment: async (): Promise<ApiResponse<EmploymentInfoRequest & { status: string }>> => {
    const response = await apiClient.get<ApiResponse<EmploymentInfoRequest & { status: string }>>(
      `${KYC_BASE}/employment`
    );
    return response.data;
  },

  // ==========================================================================
  // DOCUMENT UPLOAD
  // ==========================================================================

  /**
   * Get uploaded documents
   */
  getDocuments: async (): Promise<ApiResponse<KycDocument[]>> => {
    const response = await apiClient.get<ApiResponse<KycDocument[]>>(
      `${KYC_BASE}/documents`
    );
    return response.data;
  },

  /**
   * Upload identity document
   */
  uploadDocument: async (data: {
    type: 'passport' | 'national_id' | 'drivers_license';
    frontImage: File;
    backImage?: File;
    documentNumber?: string;
    expiryDate?: string;
    issuingCountry: string;
  }): Promise<ApiResponse<KycDocument>> => {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('frontImage', data.frontImage);
    if (data.backImage) formData.append('backImage', data.backImage);
    if (data.documentNumber) formData.append('documentNumber', data.documentNumber);
    if (data.expiryDate) formData.append('expiryDate', data.expiryDate);
    formData.append('issuingCountry', data.issuingCountry);

    const response = await apiClient.post<ApiResponse<KycDocument>>(
      `${KYC_BASE}/documents/identity`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Upload proof of address document
   */
  uploadProofOfAddress: async (data: {
    type: 'utility_bill' | 'bank_statement';
    document: File;
    issueDate: string;
  }): Promise<ApiResponse<KycDocument>> => {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('document', data.document);
    formData.append('issueDate', data.issueDate);

    const response = await apiClient.post<ApiResponse<KycDocument>>(
      `${KYC_BASE}/documents/address`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Upload selfie for verification
   */
  uploadSelfie: async (selfie: File): Promise<ApiResponse<KycDocument>> => {
    const formData = new FormData();
    formData.append('selfie', selfie);

    const response = await apiClient.post<ApiResponse<KycDocument>>(
      `${KYC_BASE}/documents/selfie`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Delete a document
   */
  deleteDocument: async (documentId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${KYC_BASE}/documents/${documentId}`
    );
    return response.data;
  },

  // ==========================================================================
  // VERIFICATION
  // ==========================================================================

  /**
   * Start verification process
   */
  startVerification: async (): Promise<ApiResponse<{
    verificationId: UUID;
    status: string;
    message: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      verificationId: UUID;
      status: string;
      message: string;
    }>>(`${KYC_BASE}/verify`);
    return response.data;
  },

  /**
   * Get verification status
   */
  getVerificationStatus: async (verificationId: UUID): Promise<ApiResponse<{
    id: UUID;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    steps: Array<{
      name: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      message?: string;
    }>;
    completedAt?: string;
    result?: {
      level: KycLevel;
      issues?: string[];
    };
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      id: UUID;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      steps: Array<{
        name: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        message?: string;
      }>;
      completedAt?: string;
      result?: {
        level: KycLevel;
        issues?: string[];
      };
    }>>(`${KYC_BASE}/verify/${verificationId}`);
    return response.data;
  },

  /**
   * Request re-verification
   */
  requestReverification: async (reason?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `${KYC_BASE}/reverify`,
      { reason }
    );
    return response.data;
  },

  // ==========================================================================
  // ADMIN KYC ENDPOINTS
  // ==========================================================================

  getAdminPendingReviews: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await apiClient.get(`${KYC_BASE}/admin/pending`, { params });
    return response.data;
  },

  getAdminUserKyc: async (userId: string) => {
    const response = await apiClient.get(`${KYC_BASE}/admin/users/${userId}`);
    return response.data;
  },

  adminReviewKyc: async (userId: string, data: { status: 'approved' | 'rejected' | 'pending'; notes?: string }) => {
    const response = await apiClient.patch(`${KYC_BASE}/admin/users/${userId}/review`, data);
    return response.data;
  },

  getAdminKycStats: async () => {
    const response = await apiClient.get(`${KYC_BASE}/admin/stats`);
    return response.data;
  },
};

export default kycApi;
