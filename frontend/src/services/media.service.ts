import api from './api';
import { MediaItem } from '../types';

export interface MediaFilters {
  folder?: string;
  clientId?: string;
  search?: string;
}

export const mediaService = {
  getAll: async (filters?: MediaFilters): Promise<MediaItem[]> => {
    return api.get<MediaItem[]>('/media', { params: filters });
  },

  create: async (media: Omit<MediaItem, 'id' | 'uploadedAt'>): Promise<MediaItem> => {
    return api.post<MediaItem>('/media', media);
  },

  delete: async (id: string): Promise<{ id: string }> => {
    return api.delete<{ id: string }>(`/media/${id}`);
  },
};

export default mediaService;
