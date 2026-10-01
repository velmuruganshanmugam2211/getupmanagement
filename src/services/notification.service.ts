import api from './api';
import { Notification } from '../types';

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export const notificationService = {
  getAll: async (): Promise<NotificationResponse> => {
    return api.get<NotificationResponse>('/notifications');
  },

  markRead: async (id: string): Promise<{ id: string }> => {
    return api.patch<{ id: string }>(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    return api.patch<void>('/notifications/read-all');
  },
};

export default notificationService;
