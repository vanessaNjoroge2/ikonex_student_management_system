import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitRecord>();

/**
 * Creates an in-memory IP rate limiter middleware
 * @param windowMs Time window in milliseconds
 * @param maxRequests Maximum requests allowed per IP within the windowMs
 */
export const rateLimiter = (windowMs: number, maxRequests: number) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = ipRequestMap.get(ip);

    // If no record exists or the time window has expired, reset the record
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
    }

    record.count++;
    ipRequestMap.set(ip, record);

    if (record.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return sendError(
        res,
        'Too many requests from this IP, please try again later.',
        429,
        'TOO_MANY_REQUESTS'
      );
    }

    next();
  };
};
