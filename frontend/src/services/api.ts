import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  public status?: number;
  public errors?: any[];

  constructor(message: string, status?: number, errors?: any[]) {
    super(message);
    this.status = status;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('getup_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle data unwrapping & error formatting
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string; errors?: any[] }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An error occurred with the API request';

    // Handle 401 Unauthorized
    if (status === 401) {
      localStorage.removeItem('getup_token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.dispatchEvent(new CustomEvent('getup:unauthorized'));
      }
    }

    const apiErr = new ApiError(message, status, error.response?.data?.errors);
    return Promise.reject(apiErr);
  }
);

export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<{ success: boolean; data: T }>(url, config);
    return response.data.data !== undefined ? response.data.data : (response.data as unknown as T);
  },

  post: async <T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<{ success: boolean; data: T }>(url, body, config);
    return response.data.data !== undefined ? response.data.data : (response.data as unknown as T);
  },

  put: async <T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<{ success: boolean; data: T }>(url, body, config);
    return response.data.data !== undefined ? response.data.data : (response.data as unknown as T);
  },

  patch: async <T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<{ success: boolean; data: T }>(url, body, config);
    return response.data.data !== undefined ? response.data.data : (response.data as unknown as T);
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<{ success: boolean; data: T }>(url, config);
    return response.data.data !== undefined ? response.data.data : (response.data as unknown as T);
  },
};

export default api;
