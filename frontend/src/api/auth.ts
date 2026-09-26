import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password?: string;
  pin?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
  token: string;
}

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  return apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getMe = async (): Promise<AuthResponse['user']> => {
  return apiClient<AuthResponse['user']>('/auth/me', {
    method: 'GET',
  });
};
