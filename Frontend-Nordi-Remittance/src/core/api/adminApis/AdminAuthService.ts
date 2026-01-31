import axios from 'axios';

// Define the base URL for your backend API
const baseURL = "http://localhost:3000/api/admin/auth";

// Define the interface for the login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Define the interface for the login response
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  }
}

// Add login function to call backend API
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await axios.post(`${baseURL}/login`, data);
  // The backend returns { token, admin: { email } }
  // Adapt to expected frontend structure
  return {
    token: response.data.token,
    user: {
      id: response.data.admin.id || "", // fallback if id not present
      name: response.data.admin.name || "",
      email: response.data.admin.email,
    }
  };
}