import { Request, Response, NextFunction } from 'express';
import { store } from '../services/store';
import { successResponse } from '../utils/apiResponse';
import { Campaign } from '../types';

export const getCampaigns = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const campaigns = store.getCampaigns();
    return successResponse(res, campaigns, 'Campaigns retrieved');
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newCamp: Campaign = {
      ...data,
      id: 'cmp-' + Date.now()
    };
    store.setCampaigns([...store.getCampaigns(), newCamp]);
    store.addLog('System', 'Admin', 'Launched campaign', `${newCamp.name} for ${newCamp.clientName}`, 'system');
    return successResponse(res, newCamp, 'Campaign created', 201);
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const campaigns = store.getCampaigns().map(c => c.id === id ? { ...c, ...updates } : c);
    store.setCampaigns(campaigns);
    const updated = campaigns.find(c => c.id === id);
    return successResponse(res, updated, 'Campaign updated');
  } catch (error) {
    next(error);
  }
};

export const deleteCampaign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    store.setCampaigns(store.getCampaigns().filter(c => c.id !== id));
    return successResponse(res, { id }, 'Campaign deleted');
  } catch (error) {
    next(error);
  }
};
