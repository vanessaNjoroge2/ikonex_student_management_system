import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Replace req body/query/params with parsed versions for type safety and defaults
      if (parsed.body) {
        req.body = parsed.body;
      }
      if (parsed.query) {
        Object.keys(req.query).forEach(key => delete (req.query as any)[key]);
        Object.assign(req.query, parsed.query);
      }
      if (parsed.params) {
        Object.keys(req.params).forEach(key => delete (req.params as any)[key]);
        Object.assign(req.params, parsed.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Respond directly with JSON to avoid Express 5 async error-handler edge cases
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation Error',
            details: error.issues,
          },
        });
        return;
      }
      next(error);
    }
  };
};
