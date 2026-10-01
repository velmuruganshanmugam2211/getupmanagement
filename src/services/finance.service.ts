import api from './api';
import { Invoice, Payment, Expense } from '../types';

export interface FinanceOverviewData {
  totalInvoiced: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  totalExpenses: number;
  netCashflow: number;
  invoicesCount: number;
  paymentsCount: number;
  expensesCount: number;
}

export const financeService = {
  getOverview: async (): Promise<FinanceOverviewData> => {
    return api.get<FinanceOverviewData>('/finance/overview');
  },

  // Invoices & Quotations
  getInvoices: async (params?: { clientId?: string; status?: string; documentType?: string; search?: string }): Promise<Invoice[]> => {
    return api.get<Invoice[]>('/finance/invoices', { params });
  },

  createInvoice: async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
    return api.post<Invoice>('/finance/invoices', invoice);
  },

  markInvoicePaid: async (id: string, paymentMethod = 'Bank Transfer'): Promise<{ invoiceId: string; payment: Payment }> => {
    return api.post(`/finance/invoices/${id}/pay`, { paymentMethod });
  },

  deleteInvoice: async (id: string): Promise<{ id: string }> => {
    return api.delete<{ id: string }>(`/finance/invoices/${id}`);
  },

  // Payments
  getPayments: async (params?: { clientId?: string; search?: string }): Promise<Payment[]> => {
    return api.get<Payment[]>('/finance/payments', { params });
  },

  createPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
    return api.post<Payment>('/finance/payments', payment);
  },

  deletePayment: async (id: string): Promise<{ id: string }> => {
    return api.delete<{ id: string }>(`/finance/payments/${id}`);
  },

  // Expenses
  getExpenses: async (params?: { category?: string; search?: string }): Promise<Expense[]> => {
    return api.get<Expense[]>('/finance/expenses', { params });
  },

  createExpense: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    return api.post<Expense>('/finance/expenses', expense);
  },

  deleteExpense: async (id: string): Promise<{ id: string }> => {
    return api.delete<{ id: string }>(`/finance/expenses/${id}`);
  },
};

export default financeService;
