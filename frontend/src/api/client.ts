export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  public code: string;
  public status: number;
  
  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json: any;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error('Invalid JSON response from server');
  }

  if (!response.ok || (json.success === false)) {
    const errorMsg = json.error?.message || response.statusText || 'Unknown API Error';
    const errorCode = json.error?.code || 'UNKNOWN_ERROR';
    throw new ApiError(errorMsg, errorCode, response.status);
  }

  // Handle standard success response format { success: true, data: T }
  if (json && 'success' in json && 'data' in json) {
    return json.data as T;
  }
  
  // Fallback for responses that just return the raw object
  return json as T;
}
