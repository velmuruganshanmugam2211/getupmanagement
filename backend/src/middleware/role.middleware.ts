import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ForbiddenError } from '../utils/errors';

export const normalizeRole = (role: string): string => {
  return role.replace(/[\s_-]/g, '').toUpperCase();
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  const normalizedAllowed = allowedRoles.map(normalizeRole);

  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('User not authenticated'));
    }

    const userRole = normalizeRole(req.user.role);
    if (!normalizedAllowed.includes(userRole)) {
      return next(new ForbiddenError(`Access denied: Role '${req.user.role}' lacks required permissions`));
    }

    next();
  };
};

export const authorizeModule = (module: 'clients' | 'packages' | 'content' | 'calendar' | 'tasks' | 'campaigns' | 'finance' | 'media' | 'team' | 'reports' | 'settings') => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('User not authenticated'));
    }

    const role = req.user.role;
    let allowed = false;

    if (role === 'Super Admin' || role === 'Admin') {
      allowed = true;
    } else if (role === 'Digital Marketer') {
      allowed = ['clients', 'content', 'calendar', 'tasks', 'campaigns', 'reports', 'media'].includes(module);
    } else if (role === 'Designer') {
      allowed = ['content', 'calendar', 'tasks', 'media'].includes(module);
    } else if (role === 'Video Editor') {
      allowed = ['content', 'calendar', 'tasks', 'media'].includes(module);
    }

    if (!allowed) {
      return next(new ForbiddenError(`Access denied: Your role (${role}) is not authorized to access the ${module} module`));
    }

    next();
  };
};
