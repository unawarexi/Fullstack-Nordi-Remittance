import axios from 'axios';

// Define the base URL for your backend API
const baseURL = "http://localhost:3000/api/auth";
// const baseURL = "https://remit-system.onrender.com/api/form"

// interfaces for the banking information
export interface BankingInfo {
  // Step 1: Personal Details
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string | Date;
  gender: string;
  nationality: string;
  countryOfResidence: string;
  maritalStatus: string;

  // Step 2: Identity Verification
  profilePicture: File | null;
  governmentId: File | null;
  idType: string;
  idNumber: string;
  idExpiryDate: string | Date;
  proofOfAddress: File | null;
  addressDocType: string;
  socialSecurityNumber: string;
  taxIdentificationNumber: string;

  // Step 3: Contact Information
  email: string;
  mobileNumber: string;
  alternativePhone: string;
  homeAddress: string;
  city: string;
  stateProvince: string;
  zipCode: string;
  country: string;

  // Step 4: Banking Preferences
  accountType: string;
  currency: string;
  sourceOfIncome: string;
  monthlyIncomeRange: string;
  initialDeposit: number;
  employmentStatus: string;
  employerName: string;
  occupation: string;

  // Step 5: Bank Account Details
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankAddress: string;
  ibanNumber: string;
  routingNumber: string;
  swiftBic: string;

  // Step 6: Security Setup
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
  enableTwoFactor: boolean;
  twoFactorMethod: string;

  // Step 7: Terms and Verification
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToDataSharing: boolean;
  referralCode: string;
  selfieWithId: File | null;
  signature: File | null;
  inviteCode: string;
}

// Add login types
export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    accountNumber: string;
    kycStatus: string;
  };
}

// Define the API service functions
const apiService = {
  saveBankingInfo: async (data: BankingInfo) => {
    try {
      // If you need to send files, use FormData
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (
          value instanceof File ||
          value === null ||
          value === undefined
        ) {
          if (value) formData.append(key, value);
        } else if (typeof value === "boolean" || typeof value === "number") {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value as string);
        }
      });

      const response = await axios.post(`${baseURL}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error saving banking information:', error);
      throw new Error('An error occurred while saving banking information');
    }
  },

  // Add login function
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post(`${baseURL}/login`, data);
    return response.data;
  },
};

export default apiService;
