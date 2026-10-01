import api from './api';
import { Task, TaskStatus } from '../types';

export interface TaskFilters {
  search?: string;
  clientId?: string;
  assignedToId?: string;
  status?: string;
  priority?: string;
}

export const taskService = {
  getAll: async (filters?: TaskFilters): Promise<Task[]> => {
    return api.get<Task[]>('/tasks', { params: filters });
  },

  create: async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
    return api.post<Task>('/tasks', task);
  },

  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    return api.put<Task>(`/tasks/${id}`, updates);
  },

  updateStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    return api.patch<Task>(`/tasks/${id}/status`, { status });
  },

  delete: async (id: string): Promise<{ id: string }> => {
    return api.delete<{ id: string }>(`/tasks/${id}`);
  },
};

export default taskService;
