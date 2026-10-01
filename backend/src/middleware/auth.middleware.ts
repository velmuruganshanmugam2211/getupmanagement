import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { store } from '../services/store';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    let payload: TokenPayload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError('Token is expired or invalid');
    }

    // Look in memory store first, then DB
    let user = store.getUsers().find(u => u.id === payload.userId);
    if (!user) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, role: true, name: true, status: true },
        });
        if (dbUser) user = dbUser as any;
      } catch {}
    }

    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('User account is inactive or not found');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    next();
  } catch (error) {
    next(error);
  }
};
