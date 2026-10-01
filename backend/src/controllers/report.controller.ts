import { Request, Response, NextFunction } from 'express';
import { store } from '../services/store';
import { successResponse } from '../utils/apiResponse';

export const getReportsData = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = store.getClients();
    const invoices = store.getInvoices();
    const payments = store.getPayments();
    const expenses = store.getExpenses();
    const quotas = store.getQuotas();

    const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
    const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = Math.max(0, totalCollected - totalExpenses);

    const contentPerformance = quotas.map(q => ({
      name: q.clientName.split(' ')[0],
      allocated: Object.values(q.items).reduce((s, it) => s + it.allocated, 0),
      completed: Object.values(q.items).reduce((s, it) => s + it.completed, 0),
    }));

    const expenseByCategoryMap: Record<string, number> = {};
    expenses.forEach(e => {
      expenseByCategoryMap[e.category] = (expenseByCategoryMap[e.category] || 0) + e.amount;
    });
    const expenseData = Object.entries(expenseByCategoryMap).map(([name, value]) => ({ name, value }));

    return successResponse(res, {
      financials: {
        totalInvoiced,
        totalCollected,
        totalExpenses,
        netProfit
      },
      contentPerformance,
      expenseData,
      clientsCount: clients.length
    }, 'Reports data retrieved');
  } catch (error) {
    next(error);
  }
};
