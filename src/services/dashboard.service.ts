import api from './api';
import { Task, Invoice, ActivityLog } from '../types';

export interface DashboardStatsData {
  metrics: {
    activeClientsCount: number;
    totalInvoicedRevenue: number;
    totalCollectedRevenue: number;
    totalPendingPayments: number;
    totalExpenses: number;
    estimatedProfit: number;
  };
  quotaTotals: Record<string, { allocated: number; completed: number; remaining: number }>;
  urgentTasks: Task[];
  pendingInvoices: Invoice[];
  recentActivity: ActivityLog[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStatsData> => {
    return api.get<DashboardStatsData>('/dashboard/stats');
  },
};

export default dashboardService;
