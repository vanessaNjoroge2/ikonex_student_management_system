import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { sendError } from '../utils/response';
import { Role } from '@prisma/client';
import { prisma } from '../config/db';

export const requireAuth = (roles?: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authorization token required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.jwtSecret) as { id: string; email: string; role: Role };

      // Verify that the user still exists in the database (e.g. not deleted/re-seeded) and is active
      const userExists = await prisma.prismaUser.findUnique({
        where: { id: decoded.id }
      });
      if (!userExists || userExists.isSuspended) {
        return sendError(res, 'Invalid or expired authorization token', 401, 'UNAUTHORIZED');
      }

      req.user = decoded;

      if (roles && roles.length > 0 && !roles.includes(decoded.role)) {
        return sendError(res, 'Access forbidden: insufficient permissions', 403, 'FORBIDDEN');
      }

      next();
    } catch (err) {
      if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
        return sendError(res, 'Invalid or expired authorization token', 401, 'UNAUTHORIZED');
      }
      next(err);
    }
  };
};
