import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/apiResponse';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode, err.errors || []);
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 'Validation error', 422, formattedErrors);
  }

  // Handle Prisma known errors
  if ((err as any).code === 'P2002') {
    return errorResponse(res, 'A unique constraint was violated on this resource', 409);
  }

  if ((err as any).code === 'P2025') {
    return errorResponse(res, 'Record not found in database', 404);
  }

  console.error('Unhandled Server Error:', err);
  return errorResponse(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500
  );
};
