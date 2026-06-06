import { Response } from 'express';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    total?: number;
    limit?: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: { page?: number; total?: number; limit?: number }
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  code = 'INTERNAL_SERVER_ERROR',
  details?: any
): Response => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
  return res.status(statusCode).json(response);
};
