import { Request, Response, NextFunction } from 'express';
import { store } from '../services/store';
import { successResponse } from '../utils/apiResponse';

export const getSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = store.getSettings();
    return successResponse(res, settings, 'Settings retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = req.body;
    const settings = { ...store.getSettings(), ...updates };
    store.setSettings(settings);
    store.addLog('System', 'Admin', 'Updated organization settings', 'Company Profile & Billing', 'system');
    return successResponse(res, settings, 'Settings updated');
  } catch (error) {
    next(error);
  }
};

export const getActivityLogs = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = store.getActivityLogs();
    return successResponse(res, logs, 'Activity logs retrieved');
  } catch (error) {
    next(error);
  }
};
