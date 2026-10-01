import api from './api';
import { ContentItem, ContentStatus } from '../types';

export interface ContentFilters {
  search?: string;
  clientId?: string;
  contentType?: string;
  status?: string;
  platform?: string;
}

export const contentService = {
  getAll: async (filters?: ContentFilters): Promise<ContentItem[]> => {
    return api.get<ContentItem[]>('/content', { params: filters });
  },

  create: async (content: Omit<ContentItem, 'id' | 'createdAt'>): Promise<ContentItem> => {
    return api.post<ContentItem>('/content', content);
  },

  update: async (id: string, updates: Partial<ContentItem>): Promise<ContentItem> => {
    return api.put<ContentItem>(`/content/${id}`, updates);
  },

  updateStatus: async (id: string, status: ContentStatus): Promise<ContentItem> => {
    return api.patch<ContentItem>(`/content/${id}/status`, { status });
  },

  delete: async (id: string): Promise<{ id: string }> => {
    return api.delete<{ id: string }>(`/content/${id}`);
  },
};

export default contentService;
