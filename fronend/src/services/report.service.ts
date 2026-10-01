import api from './api';

export interface ReportData {
  financials: {
    totalInvoiced: number;
    totalCollected: number;
    totalExpenses: number;
    netProfit: number;
  };
  contentPerformance: { name: string; allocated: number; completed: number }[];
  expenseData: { name: string; value: number }[];
  clientsCount: number;
}

export const reportService = {
  getReports: async (): Promise<ReportData> => {
    return api.get<ReportData>('/reports');
  },
};

export default reportService;
