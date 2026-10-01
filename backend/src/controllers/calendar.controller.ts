import { Request, Response, NextFunction } from 'express';
import { store } from '../services/store';
import { successResponse } from '../utils/apiResponse';

export const getCalendarEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId, type } = req.query;
    let contents = store.getContents();

    if (clientId && clientId !== 'all') {
      contents = contents.filter(c => c.clientId === clientId);
    }
    if (type && type !== 'all') {
      contents = contents.filter(c => c.contentType === type);
    }

    const events = contents.map(item => ({
      id: item.id,
      title: item.title,
      date: item.publishDate || item.dueDate,
      publishDate: item.publishDate,
      dueDate: item.dueDate,
      contentType: item.contentType,
      platform: item.platform,
      clientName: item.clientName,
      clientId: item.clientId,
      status: item.status,
      assignedToName: item.assignedToName,
      priority: item.priority
    }));

    return successResponse(res, events, 'Calendar events retrieved');
  } catch (error) {
    next(error);
  }
};
