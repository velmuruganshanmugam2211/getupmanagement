import api from './api';
import { Client } from '../types';

export interface ClientFilters {
  search?: string;
  status?: string;
  packageId?: string;
  paymentStatus?: string;
}

export const clientService = {
  getAll: async (filters?: ClientFilters): Promise<Client[]> => {
    return api.get<Client[]>('/clients', { params: filters });
  },

  getById: async (id: string): Promise<Client & { quotas: any[]; contents: any[]; tasks: any[]; invoices: any[]; payments: any[]; media: any[] }> => {
    return api.get(`/clients/${id}`);
  },

  create: async (client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    return api.post<Client>('/clients', client);
  },

  update: async (id: string, updates: Partial<Client>): Promise<Client> => {
    return api.put<Client>(`/clients/${id}`, updates);
  },

  delete: async (id: string): Promise<{ id: string }> => {
    return api.delete<{ id: string }>(`/clients/${id}`);
  },
};

export default clientService;
