import { Request, Response, NextFunction } from 'express';
import { store } from '../services/store';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { ContentItem, ContentStatus, MonthlyQuota } from '../types';

const syncQuotaIncrement = (clientId: string, type: ContentItem['contentType'], delta: number) => {
  const typeKeyMap: Record<string, keyof MonthlyQuota['items']> = {
    'Video': 'videos',
    'Reel': 'reels',
    'Poster': 'posters',
    'Photo': 'photos',
    'Story': 'stories',
    'Carousel': 'posters',
    'Ad Creative': 'posters'
  };
  const quotaKey = typeKeyMap[type] || 'posters';

  const quotas = store.getQuotas().map(q => {
    if (q.clientId !== clientId) return q;
    const currentItem = q.items[quotaKey];
    const newCompleted = Math.max(0, currentItem.completed + delta);
    const remaining = Math.max(0, currentItem.allocated - newCompleted);
    const overDelivered = Math.max(0, newCompleted - currentItem.allocated);

    return {
      ...q,
      items: {
        ...q.items,
        [quotaKey]: {
          ...currentItem,
          completed: newCompleted,
          remaining,
          overDelivered
        }
      }
    };
  });

  store.setQuotas(quotas);
};

export const getContents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, clientId, contentType, status, platform } = req.query;
    let contents = store.getContents();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      contents = contents.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.assignedToName.toLowerCase().includes(q)
      );
    }

    if (clientId && clientId !== 'all') {
      contents = contents.filter(c => c.clientId === clientId);
    }
    if (contentType && contentType !== 'all') {
      contents = contents.filter(c => c.contentType === contentType);
    }
    if (status && status !== 'all') {
      contents = contents.filter(c => c.status === status);
    }
    if (platform && platform !== 'all') {
      contents = contents.filter(c => c.platform === platform);
    }

    return successResponse(res, contents, 'Content items retrieved');
  } catch (error) {
    next(error);
  }
};

export const createContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newId = 'cnt-' + Date.now();
    const newContent: ContentItem = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString()
    };

    const contents = [newContent, ...store.getContents()];
    store.setContents(contents);

    if (newContent.status === 'Published') {
      syncQuotaIncrement(newContent.clientId, newContent.contentType, 1);
    }

    store.addLog('System', 'Admin', 'Created content item', `${newContent.contentType}: ${newContent.title}`, 'content');
    return successResponse(res, newContent, 'Content scheduled', 201);
  } catch (error) {
    next(error);
  }
};

export const updateContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const existing = store.getContents().find(c => c.id === id);

    if (!existing) {
      return errorResponse(res, 'Content item not found', 404);
    }

    if (updates.status && updates.status !== existing.status) {
      if (updates.status === 'Published' && existing.status !== 'Published') {
        syncQuotaIncrement(existing.clientId, existing.contentType, 1);
      } else if (existing.status === 'Published' && updates.status !== 'Published') {
        syncQuotaIncrement(existing.clientId, existing.contentType, -1);
      }
    }

    const contents = store.getContents().map(c => c.id === id ? { ...c, ...updates } : c);
    store.setContents(contents);
    const updated = contents.find(c => c.id === id);

    return successResponse(res, updated, 'Content updated');
  } catch (error) {
    next(error);
  }
};

export const updateContentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const existing = store.getContents().find(c => c.id === id);

    if (!existing) {
      return errorResponse(res, 'Content item not found', 404);
    }

    if (status === 'Published' && existing.status !== 'Published') {
      syncQuotaIncrement(existing.clientId, existing.contentType, 1);
    } else if (existing.status === 'Published' && status !== 'Published') {
      syncQuotaIncrement(existing.clientId, existing.contentType, -1);
    }

    const contents = store.getContents().map(c => c.id === id ? { ...c, status } : c);
    store.setContents(contents);
    const updated = contents.find(c => c.id === id);

    store.addLog('System', 'Admin', 'Updated content status', `${existing.title} -> ${status}`, 'content');
    return successResponse(res, updated, 'Status updated');
  } catch (error) {
    next(error);
  }
};

export const deleteContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = store.getContents().find(c => c.id === id);
    if (existing && existing.status === 'Published') {
      syncQuotaIncrement(existing.clientId, existing.contentType, -1);
    }

    const contents = store.getContents().filter(c => c.id !== id);
    store.setContents(contents);

    return successResponse(res, { id }, 'Content removed');
  } catch (error) {
    next(error);
  }
};
