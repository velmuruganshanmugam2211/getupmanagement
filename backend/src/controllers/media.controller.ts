import { Request, Response, NextFunction } from 'express';
import { store } from '../services/store';
import { successResponse } from '../utils/apiResponse';
import { MediaItem } from '../types';

export const getMediaItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folder, clientId, search } = req.query;
    let media = store.getMedia();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      media = media.filter(m => 
        m.fileName.toLowerCase().includes(q) ||
        m.clientName.toLowerCase().includes(q)
      );
    }
    if (folder && folder !== 'all') {
      media = media.filter(m => m.folder === folder);
    }
    if (clientId && clientId !== 'all') {
      media = media.filter(m => m.clientId === clientId);
    }

    return successResponse(res, media, 'Media items retrieved');
  } catch (error) {
    next(error);
  }
};

export const createMediaItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newMedia: MediaItem = {
      ...data,
      id: 'med-' + Date.now(),
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    store.setMedia([newMedia, ...store.getMedia()]);
    store.addLog('System', 'Admin', 'Uploaded media asset', `${newMedia.fileName} for ${newMedia.clientName}`, 'content');
    return successResponse(res, newMedia, 'Media uploaded', 201);
  } catch (error) {
    next(error);
  }
};

export const deleteMediaItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    store.setMedia(store.getMedia().filter(m => m.id !== id));
    return successResponse(res, { id }, 'Media deleted');
  } catch (error) {
    next(error);
  }
};
