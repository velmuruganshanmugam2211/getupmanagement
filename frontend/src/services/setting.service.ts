import api from './api';
import { ActivityLog } from '../types';

export const settingService = {
  getSettings: async (): Promise<Record<string, any>> => {
    return api.get<Record<string, any>>('/settings');
  },

  updateSettings: async (settings: Record<string, any>): Promise<Record<string, any>> => {
    return api.put<Record<string, any>>('/settings', settings);
  },

  getActivityLogs: async (): Promise<ActivityLog[]> => {
    return api.get<ActivityLog[]>('/settings/activity');
  },
};

export default settingService;
