import { Request, Response, NextFunction } from 'express';
import { store } from '../services/store';
import { successResponse } from '../utils/apiResponse';
import { Package, MonthlyQuota } from '../types';

export const getPackages = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const packages = store.getPackages();
    return successResponse(res, packages, 'Packages retrieved');
  } catch (error) {
    next(error);
  }
};

export const createPackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newPkg: Package = {
      ...data,
      id: 'pkg-' + Date.now()
    };
    store.setPackages([...store.getPackages(), newPkg]);
    store.addLog('System', 'Admin', 'Created service package tier', newPkg.name, 'package');
    return successResponse(res, newPkg, 'Package tier created', 201);
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const packages = store.getPackages().map(p => p.id === id ? { ...p, ...updates } : p);
    store.setPackages(packages);
    const updated = packages.find(p => p.id === id);
    return successResponse(res, updated, 'Package updated');
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    store.setPackages(store.getPackages().filter(p => p.id !== id));
    return successResponse(res, { id }, 'Package deleted');
  } catch (error) {
    next(error);
  }
};

// Quotas
export const getQuotas = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const quotas = store.getQuotas();
    return successResponse(res, quotas, 'Monthly quotas retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateQuotaNumbers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { itemType, allocated, completed } = req.body;
    
    const quotas = store.getQuotas().map(q => {
      if (q.id !== id) return q;
      const remaining = Math.max(0, allocated - completed);
      const overDelivered = Math.max(0, completed - allocated);

      const newItems = {
        ...q.items,
        [itemType]: {
          type: itemType.slice(0, -1),
          allocated,
          completed,
          remaining,
          overDelivered
        }
      };

      const totalRemaining = Object.values(newItems).reduce((sum: number, it: any) => sum + it.remaining, 0);
      let status: MonthlyQuota['status'] = 'on_track';
      if (totalRemaining === 0) status = 'completed';
      else if (totalRemaining > 15) status = 'overdue';
      else if (totalRemaining > 8) status = 'at_risk';

      return {
        ...q,
        items: newItems,
        status
      };
    });

    store.setQuotas(quotas);
    const updated = quotas.find(q => q.id === id);
    return successResponse(res, updated, 'Quota updated');
  } catch (error) {
    next(error);
  }
};

export const generateNewMonthQuotas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { monthKey, monthName } = req.body;
    const clients = store.getClients().filter(c => c.status === 'active');
    const packages = store.getPackages();

    const newQuotas: MonthlyQuota[] = clients.map(client => {
      const clientPkg = packages.find(p => p.id === client.packageId) || packages[0];
      return {
        id: `quota-${monthKey}-${client.id}`,
        clientId: client.id,
        clientName: client.businessName,
        month: monthKey,
        monthLabel: monthName,
        items: {
          videos: { type: 'video', allocated: clientPkg.quota.videos, completed: 0, remaining: clientPkg.quota.videos, overDelivered: 0 },
          reels: { type: 'reel', allocated: clientPkg.quota.reels, completed: 0, remaining: clientPkg.quota.reels, overDelivered: 0 },
          posters: { type: 'poster', allocated: clientPkg.quota.posters, completed: 0, remaining: clientPkg.quota.posters, overDelivered: 0 },
          photos: { type: 'photo', allocated: clientPkg.quota.photos, completed: 0, remaining: clientPkg.quota.photos, overDelivered: 0 },
          stories: { type: 'story', allocated: clientPkg.quota.stories, completed: 0, remaining: clientPkg.quota.stories, overDelivered: 0 },
        },
        status: 'on_track'
      };
    });

    store.setQuotas([...newQuotas, ...store.getQuotas()]);
    store.addLog('System', 'Admin', 'Generated monthly quota batch', monthName, 'system');
    return successResponse(res, newQuotas, `Generated quotas for ${monthName}`, 201);
  } catch (error) {
    next(error);
  }
};
