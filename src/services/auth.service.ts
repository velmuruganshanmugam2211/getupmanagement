import api from './api';
import { User, UserRole } from '../types';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  login: async (email?: string, password?: string, role?: UserRole): Promise<AuthResponse> => {
    const data = await api.post<AuthResponse>('/auth/login', { email, password, role });
    if (data.accessToken) {
      localStorage.setItem('getup_token', data.accessToken);
    }
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    return api.get<User>('/auth/me');
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('getup_token');
    }
  },
};

export default authService;
