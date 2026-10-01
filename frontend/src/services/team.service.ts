import api from './api';
import { User } from '../types';

export interface TeamFilters {
  search?: string;
  role?: string;
  workload?: string;
}

export const teamService = {
  getAll: async (filters?: TeamFilters): Promise<User[]> => {
    return api.get<User[]>('/team', { params: filters });
  },

  create: async (user: Omit<User, 'id'>): Promise<User> => {
    return api.post<User>('/team', user);
  },

  update: async (id: string, updates: Partial<User>): Promise<User> => {
    return api.put<User>(`/team/${id}`, updates);
  },

  delete: async (id: string): Promise<{ id: string }> => {
    return api.delete<{ id: string }>(`/team/${id}`);
  },
};

export default teamService;
