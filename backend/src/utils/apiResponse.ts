import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const successResponse = <T>(
  res: Response,
  data: T,
  message = 'Request successful',
  statusCode = 200,
  pagination?: PaginationMeta
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  });
};

export const errorResponse = (
  res: Response,
  message = 'Something went wrong',
  statusCode = 500,
  errors: any[] = []
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
