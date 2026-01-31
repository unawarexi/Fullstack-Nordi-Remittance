/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Define the base URL for your backend API
const baseURL = "http://localhost:3000/api/admin/users";

// Get all users with pagination, filtering, and search
export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  kycStatus?: string;
  isActive?: boolean;
}) => {
  const response = await axios.get(baseURL, { params });
  return response.data;
};

// Get user by ID
export const getUserById = async (id: string) => {
  const response = await axios.get(`${baseURL}/${id}`);
  return response.data;
};

// Create user (admin)
export const createUser = async (userData: any) => {
  const response = await axios.post(baseURL, userData);
  return response.data;
};

// Update user by ID (admin)
export const updateUserById = async (id: string, updates: Partial<any>) => {
  // Remove password and securityAnswer if empty or undefined
  if (!updates.password || updates.password.trim() === "") {
    delete updates.password;
  }
  if (!updates.securityAnswer || updates.securityAnswer.trim() === "") {
    delete updates.securityAnswer;
  }
  const response = await axios.put(`${baseURL}/${id}`, updates);
  return response.data;
};

// Delete all users (admin)
export const deleteAllUsers = async () => {
  const response = await axios.delete(baseURL);
  return response.data;
};

// Delete user by ID (admin)
export const deleteUserById = async (id: string) => {
  const response = await axios.delete(`${baseURL}/${id}`);
  return response.data;
};
