import { Request, Response, NextFunction } from 'express';
import { store } from '../services/store';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { Client, MonthlyQuota } from '../types';

export const getClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, packageId, paymentStatus } = req.query;
    let clients = store.getClients();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      clients = clients.filter(c => 
        c.businessName.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }

    if (status && status !== 'all') {
      clients = clients.filter(c => c.status === status);
    }
    if (packageId && packageId !== 'all') {
      clients = clients.filter(c => c.packageId === packageId);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      clients = clients.filter(c => c.paymentStatus === paymentStatus);
    }

    return successResponse(res, clients, 'Clients fetched');
  } catch (error) {
    next(error);
  }
};

export const getClientById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const client = store.getClients().find(c => c.id === id);
    if (!client) {
      return errorResponse(res, 'Client not found', 404);
    }

    const quotas = store.getQuotas().filter(q => q.clientId === id);
    const contents = store.getContents().filter(c => c.clientId === id);
    const tasks = store.getTasks().filter(t => t.clientId === id);
    const invoices = store.getInvoices().filter(i => i.clientId === id);
    const payments = store.getPayments().filter(p => p.clientId === id);
    const media = store.getMedia().filter(m => m.clientId === id);

    return successResponse(res, {
      ...client,
      quotas,
      contents,
      tasks,
      invoices,
      payments,
      media
    }, 'Client retrieved');
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientData = req.body;
    const newId = 'cli-' + Date.now();
    const newClient: Client = {
      ...clientData,
      id: newId,
      createdAt: new Date().toISOString()
    };

    const clients = [newClient, ...store.getClients()];
    store.setClients(clients);

    // Auto-create initial monthly quota from package template
    const packages = store.getPackages();
    const selectedPkg = packages.find(p => p.id === clientData.packageId) || packages[0];
    if (selectedPkg) {
      const newQuota: MonthlyQuota = {
        id: 'quota-' + Date.now(),
        clientId: newId,
        clientName: clientData.businessName,
        month: '2026-09',
        monthLabel: 'September 2026',
        items: {
          videos: { type: 'video', allocated: selectedPkg.quota.videos, completed: 0, remaining: selectedPkg.quota.videos, overDelivered: 0 },
          reels: { type: 'reel', allocated: selectedPkg.quota.reels, completed: 0, remaining: selectedPkg.quota.reels, overDelivered: 0 },
          posters: { type: 'poster', allocated: selectedPkg.quota.posters, completed: 0, remaining: selectedPkg.quota.posters, overDelivered: 0 },
          photos: { type: 'photo', allocated: selectedPkg.quota.photos, completed: 0, remaining: selectedPkg.quota.photos, overDelivered: 0 },
          stories: { type: 'story', allocated: selectedPkg.quota.stories, completed: 0, remaining: selectedPkg.quota.stories, overDelivered: 0 },
        },
        status: 'on_track'
      };
      store.setQuotas([newQuota, ...store.getQuotas()]);
    }

    store.addLog('System', 'Admin', 'Created client record', clientData.businessName, 'client');
    return successResponse(res, newClient, 'Client created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const clients = store.getClients().map(c => c.id === id ? { ...c, ...updates } : c);
    store.setClients(clients);
    const updated = clients.find(c => c.id === id);

    const clientParamId = Array.isArray(id) ? id[0] : id;
    store.addLog('System', 'Admin', 'Updated client profile', updated?.businessName || clientParamId, 'client');
    return successResponse(res, updated, 'Client updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const target = store.getClients().find(c => c.id === id);
    const clients = store.getClients().filter(c => c.id !== id);
    store.setClients(clients);

    store.setQuotas(store.getQuotas().filter(q => q.clientId !== id));

    store.addLog('System', 'Admin', 'Deleted client record', target?.businessName || (id as string), 'client');
    return successResponse(res, { id }, 'Client removed successfully');
  } catch (error) {
    next(error);
  }
};
