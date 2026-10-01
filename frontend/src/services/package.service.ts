import api from './api';
import { Package, MonthlyQuota } from '../types';

export const packageService = {
  getAll: async (): Promise<Package[]> => {
    return api.get<Package[]>('/packages');
  },

  create: async (pkg: Omit<Package, 'id'>): Promise<Package> => {
    return api.post<Package>('/packages', pkg);
  },

  update: async (id: string, updates: Partial<Package>): Promise<Package> => {
    return api.put<Package>(`/packages/${id}`, updates);
  },

  delete: async (id: string): Promise<{ id: string }> => {
    return api.delete<{ id: string }>(`/packages/${id}`);
  },

  // Monthly Quotas
  getQuotas: async (): Promise<MonthlyQuota[]> => {
    return api.get<MonthlyQuota[]>('/packages/quotas/all');
  },

  updateQuota: async (
    id: string, 
    itemType: 'videos' | 'reels' | 'posters' | 'photos' | 'stories', 
    allocated: number, 
    completed: number
  ): Promise<MonthlyQuota> => {
    return api.put<MonthlyQuota>(`/packages/quotas/${id}`, { itemType, allocated, completed });
  },

  generateMonth: async (monthKey: string, monthName: string): Promise<MonthlyQuota[]> => {
    return api.post<MonthlyQuota[]>('/packages/quotas/generate', { monthKey, monthName });
  },
};

export default packageService;
