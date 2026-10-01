import { Request, Response, NextFunction } from 'express';
import { store } from '../services/store';
import { successResponse } from '../utils/apiResponse';

export const getNotifications = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const notifs = store.getNotifications();
    const unreadCount = notifs.filter(n => !n.read).length;
    return successResponse(res, {
      notifications: notifs,
      unreadCount
    }, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const notifs = store.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    store.setNotifications(notifs);
    return successResponse(res, { id }, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const notifs = store.getNotifications().map(n => ({ ...n, read: true }));
    store.setNotifications(notifs);
    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};
