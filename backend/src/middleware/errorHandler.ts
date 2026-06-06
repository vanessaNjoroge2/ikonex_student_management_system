import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  console.error(err);
  
  if (err.name === 'ZodError' || (err.issues && Array.isArray(err.issues))) {
    return sendError(
      res,
      'Validation Error',
      400,
      'VALIDATION_ERROR',
      err.errors || err.issues
    );
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return sendError(res, message, status, code);
};
