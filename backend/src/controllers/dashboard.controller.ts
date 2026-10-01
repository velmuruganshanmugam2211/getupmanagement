import { Request, Response, NextFunction } from 'express';
import { store } from '../services/store';
import { successResponse } from '../utils/apiResponse';

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = store.getClients();
    const invoices = store.getInvoices();
    const payments = store.getPayments();
    const expenses = store.getExpenses();
    const tasks = store.getTasks();
    const contents = store.getContents();
    const quotas = store.getQuotas();
    const activityLogs = store.getActivityLogs();

    const activeClientsCount = clients.filter(c => c.status === 'active').length;
    const totalInvoicedRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalCollectedRevenue = payments.reduce((sum, pay) => sum + pay.amount, 0);
    const totalPendingPayments = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const estimatedProfit = Math.max(0, totalCollectedRevenue - totalExpenses);

    // Aggregate monthly quotas
    const quotaTotals = quotas.reduce((acc, q) => {
      acc.videos.allocated += q.items.videos.allocated;
      acc.videos.completed += q.items.videos.completed;
      acc.videos.remaining += q.items.videos.remaining;

      acc.reels.allocated += q.items.reels.allocated;
      acc.reels.completed += q.items.reels.completed;
      acc.reels.remaining += q.items.reels.remaining;

      acc.posters.allocated += q.items.posters.allocated;
      acc.posters.completed += q.items.posters.completed;
      acc.posters.remaining += q.items.posters.remaining;

      acc.photos.allocated += q.items.photos.allocated;
      acc.photos.completed += q.items.photos.completed;
      acc.photos.remaining += q.items.photos.remaining;

      acc.stories.allocated += q.items.stories.allocated;
      acc.stories.completed += q.items.stories.completed;
      acc.stories.remaining += q.items.stories.remaining;
      return acc;
    }, {
      videos: { allocated: 0, completed: 0, remaining: 0 },
      reels: { allocated: 0, completed: 0, remaining: 0 },
      posters: { allocated: 0, completed: 0, remaining: 0 },
      photos: { allocated: 0, completed: 0, remaining: 0 },
      stories: { allocated: 0, completed: 0, remaining: 0 }
    });

    const urgentTasks = tasks
      .filter(t => t.priority === 'High' || t.priority === 'Urgent')
      .slice(0, 5);

    const pendingInvoices = invoices
      .filter(inv => inv.balanceDue > 0)
      .slice(0, 5);

    return successResponse(res, {
      metrics: {
        activeClientsCount,
        totalInvoicedRevenue,
        totalCollectedRevenue,
        totalPendingPayments,
        totalExpenses,
        estimatedProfit
      },
      quotaTotals,
      urgentTasks,
      pendingInvoices,
      recentActivity: activityLogs.slice(0, 8)
    }, 'Dashboard statistics loaded');
  } catch (error) {
    next(error);
  }
};
