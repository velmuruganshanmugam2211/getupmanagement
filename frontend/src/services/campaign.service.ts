import api from './api';
import { Campaign } from '../types';

export const campaignService = {
  getAll: async (): Promise<Campaign[]> => {
    return api.get<Campaign[]>('/campaigns');
  },

  create: async (campaign: Omit<Campaign, 'id'>): Promise<Campaign> => {
    return api.post<Campaign>('/campaigns', campaign);
  },

  update: async (id: string, updates: Partial<Campaign>): Promise<Campaign> => {
    return api.put<Campaign>(`/campaigns/${id}`, updates);
  },

  delete: async (id: string): Promise<{ id: string }> => {
    return api.delete<{ id: string }>(`/campaigns/${id}`);
  },
};

export default campaignService;
